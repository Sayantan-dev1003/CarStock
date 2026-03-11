import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { InventoryGateway } from '../gateways/inventory.gateway';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { BillItemDto } from './dto/bill-item.dto';
import { CreateBillDto } from './dto/create-bill.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
    BILL_DELIVERY_QUEUE,
    JOB_DELIVER_BILL,
} from '../queues/queue.constants';

// ── Re-usable Prisma return types ────────────────────────────────────────────

type BillWithRelations = Prisma.BillGetPayload<{
    include: {
        customer: true;
        items: { include: { product: true } };
    };
}>;

type BillListItem = Prisma.BillGetPayload<{
    include: { customer: { select: { name: true } } };
}>;

interface TotalsResult {
    subtotal: number;
    cgst: number;
    sgst: number;
    total: number;
}

export interface PaginatedBills {
    data: BillListItem[];
    total: number;
    page: number;
    limit: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly inventoryGateway: InventoryGateway,
        private readonly inventoryService: InventoryService,
        @InjectQueue(BILL_DELIVERY_QUEUE) private readonly billQueue: Queue,
    ) { }

    // ── Private: generate unique bill number ───────────────────────────────────
    private generateBillNumber(): string {
        const date = new Date()
            .toISOString()
            .slice(0, 10)
            .replace(/-/g, '');
        const rand = Math.floor(10000 + Math.random() * 90000).toString();
        return `BILL-${date}-${rand}`;
    }

    // ── Private: calculate GST totals ─────────────────────────────────────────
    private calculateTotals(items: BillItemDto[], discount: number): TotalsResult {
        const subtotal = items.reduce(
            (sum, item) => sum + item.quantity * item.unitPrice,
            0,
        );
        const discountedAmount = subtotal - discount;

        if (discountedAmount < 0) {
            throw new BadRequestException('Discount cannot exceed subtotal');
        }

        const cgst = discountedAmount * 0.09;
        const sgst = discountedAmount * 0.09;
        const total = discountedAmount + cgst + sgst;

        return { subtotal, cgst, sgst, total };
    }

    // ── createBill — entire DB work is inside one $transaction ─────────────────
    async createBill(dto: CreateBillDto): Promise<BillWithRelations> {
        const discount = dto.discount ?? 0;
        const billNumber = this.generateBillNumber();

        // ── Capture validated products outside tx for post-transaction use ────────
        let validatedProducts: Product[] = [];

        const bill = await this.prisma.$transaction(
            async (tx: Prisma.TransactionClient) => {
                // ── Part 1: Validate all items before touching stock ─────────────────
                const products: Product[] = [];
                for (const item of dto.items) {
                    const product = await tx.product.findUnique({
                        where: { id: item.productId },
                    });
                    if (!product) {
                        throw new NotFoundException(
                            `Product ${item.productId} not found`,
                        );
                    }
                    if (!product.isActive) {
                        throw new BadRequestException(
                            `Product ${product.name} is no longer active`,
                        );
                    }
                    if (product.quantity < item.quantity) {
                        throw new BadRequestException(
                            `Insufficient stock for ${product.name}. ` +
                            `Available: ${product.quantity}, Requested: ${item.quantity}`,
                        );
                    }
                    products.push(product);
                }
                validatedProducts = products;

                // ── Part 2: Atomic stock deduction + StockLog per item ───────────────
                for (let i = 0; i < dto.items.length; i++) {
                    const item = dto.items[i];
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { quantity: { decrement: item.quantity } },
                    });
                    await tx.stockLog.create({
                        data: {
                            productId: item.productId,
                            type: 'DEDUCT',
                            quantity: item.quantity,
                            note: `Sold - Bill ${billNumber}`,
                        },
                    });
                }

                // ── Part 3 & 4: Totals + bill number (number generated before tx) ────
                const totals = this.calculateTotals(dto.items, discount);

                // ── Part 5: Create Bill with nested BillItems ─────────────────────────
                const createdBill = await tx.bill.create({
                    data: {
                        billNumber,
                        customerId: dto.customerId,
                        subtotal: totals.subtotal,
                        discount,
                        cgst: totals.cgst,
                        sgst: totals.sgst,
                        total: totals.total,
                        paymentMode: dto.paymentMode,
                        items: {
                            create: dto.items.map((item) => ({
                                productId: item.productId,
                                quantity: item.quantity,
                                unitPrice: item.unitPrice,
                                total: item.quantity * item.unitPrice,
                            })),
                        },
                    },
                    include: {
                        customer: true,
                        items: { include: { product: true } },
                    },
                });

                // ── Part 6: Increment customer totalSpend ─────────────────────────────
                await tx.customer.update({
                    where: { id: dto.customerId },
                    data: { totalSpend: { increment: totals.total } },
                });

                // ── Part 7: VehiclePurchaseLog (optional, only if vehicleId provided) ─
                if (dto.vehicleId) {
                    for (let i = 0; i < dto.items.length; i++) {
                        const item = dto.items[i];
                        const product = products[i];
                        await tx.vehiclePurchaseLog.create({
                            data: {
                                vehicleId: dto.vehicleId,
                                billId: createdBill.id,
                                productId: item.productId,
                                category: product.category,
                                purchasedAt: new Date(),
                            },
                        });
                    }
                }

                return createdBill;
            },
        );

        // ── POST-TRANSACTION: fire-and-forget events — never throw ────────────────
        for (let i = 0; i < dto.items.length; i++) {
            const item = dto.items[i];
            const original = validatedProducts[i];
            const newQty = original.quantity - item.quantity;

            // Real-time stock deduction broadcast
            this.inventoryGateway.emitStockUpdate(
                item.productId,
                original.name,
                newQty,
                'DEDUCT',
            );

            // Low-stock alert (emits socket event internally if triggered)
            this.inventoryService.checkAndAlertLowStock(
                item.productId,
                original.name,
                newQty,
                original.reorderLevel,
            );
        }

        // Real-time bill-created broadcast
        this.inventoryGateway.emitBillCreated(
            bill.id,
            bill.billNumber,
            bill.customer.name,
            bill.total,
        );

        this.logger.log(
            `Bill ${bill.billNumber} created for customer ${bill.customer.name}, total: ₹${bill.total.toFixed(2)}`,
        );

        // Queue background delivery job (PDF, Email, WhatsApp)
        await this.billQueue.add(
            JOB_DELIVER_BILL,
            { billId: bill.id },
            {
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
                removeOnComplete: 100,
                removeOnFail: 50,
            },
        );

        this.logger.log(`Bill delivery job queued for bill ${bill.billNumber}`);

        return bill;
    }

    // ── getBill ────────────────────────────────────────────────────────────────
    async getBill(id: string): Promise<BillWithRelations> {
        const bill = await this.prisma.bill.findUnique({
            where: { id },
            include: {
                customer: true,
                items: { include: { product: true } },
            },
        });
        if (!bill) {
            throw new NotFoundException('Bill not found');
        }
        return bill;
    }

    // ── getBills — paginated list with optional date range ────────────────────
    async getBills(
        page: number,
        limit: number,
        startDate?: string,
        endDate?: string,
    ): Promise<PaginatedBills> {
        const where: Prisma.BillWhereInput =
            startDate && endDate
                ? {
                    createdAt: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    },
                }
                : {};

        const [data, total] = await this.prisma.$transaction([
            this.prisma.bill.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { customer: { select: { name: true } } },
            }),
            this.prisma.bill.count({ where }),
        ]);

        return { data: data as BillListItem[], total, page, limit };
    }

    // ── getCustomerBills — paginated bills for one customer ───────────────────
    async getCustomerBills(
        customerId: string,
        page: number,
        limit: number,
    ): Promise<PaginatedBills> {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        const where: Prisma.BillWhereInput = { customerId };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.bill.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    customer: { select: { name: true } },
                    items: { include: { product: { select: { name: true } } } },
                },
            }),
            this.prisma.bill.count({ where }),
        ]);

        return { data: data as BillListItem[], total, page, limit };
    }
}
