import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { Product, StockLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InventoryGateway } from '../gateways/inventory.gateway';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { NotificationsService } from '../notifications/notifications.service';

// ── Response shapes ──────────────────────────────────────────────────────────

export interface AddStockResult {
    product: Product;
    stockLog: StockLog;
}

export interface StockHistoryResult {
    data: Pick<StockLog, 'id' | 'type' | 'quantity' | 'note' | 'createdAt'>[];
    total: number;
    page: number;
    limit: number;
    productName: string;
}

export interface InventorySummary {
    totalProducts: number;
    totalStockValue: number;
    totalRetailValue: number;
    outOfStockCount: number;
    lowStockCount: number;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class InventoryService {
    private readonly logger = new Logger(InventoryService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly inventoryGateway: InventoryGateway,
        private readonly emailService: EmailService,
        private readonly whatsappService: WhatsAppService,
        private readonly notificationsService: NotificationsService,
    ) { }

    // ── addStock — atomic increment, then StockLog, then reorder-clear check ──
    async addStock(dto: UpdateStockDto): Promise<AddStockResult> {
        // Step A — verify product
        const product = await this.prisma.product.findUnique({
            where: { id: dto.productId },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        if (!product.isActive) {
            throw new BadRequestException(
                'Cannot update stock for a deactivated product',
            );
        }

        const oldQuantity = product.quantity;

        // Step B — atomic increment (no read-then-write race condition)
        await this.prisma.product.update({
            where: { id: dto.productId },
            data: { quantity: { increment: dto.quantity } },
        });

        // Step C — create StockLog entry
        const stockLog = await this.prisma.stockLog.create({
            data: {
                productId: dto.productId,
                type: 'ADD',
                quantity: dto.quantity,
                note: dto.note ?? null,
            },
        });

        // Step D — fetch updated product
        const updatedProduct = await this.prisma.product.findUniqueOrThrow({
            where: { id: dto.productId },
        });

        const newQuantity = updatedProduct.quantity;

        // Step E — reorder-clear check
        // If stock was at or below reorder level and is now healthy again,
        // log for future: NotificationsService.sendPush() and
        // EmailService.sendLowStockAlert() will be wired here in Stage 13.
        if (oldQuantity <= product.reorderLevel && newQuantity > product.reorderLevel) {
            this.logger.log(
                `STOCK RESTORED: Product ${dto.productId} back above reorder level ` +
                `(was ${oldQuantity}, now ${newQuantity}, reorder: ${product.reorderLevel})`,
            );
        }

        this.logger.log(
            `Stock added: ${dto.quantity} units added to product ${dto.productId}. ` +
            `New quantity: ${newQuantity}`,
        );

        // Fire-and-forget — never awaited, never throws
        this.inventoryGateway.emitStockUpdate(
            dto.productId,
            product.name,
            newQuantity,
            'ADD',
        );

        return { product: updatedProduct, stockLog };
    }

    // ── getStockHistory — paginated log for a product ─────────────────────────
    async getStockHistory(
        productId: string,
        page: number,
        limit: number,
    ): Promise<StockHistoryResult> {
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.stockLog.findMany({
                where: { productId },
                select: {
                    id: true,
                    type: true,
                    quantity: true,
                    note: true,
                    createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.stockLog.count({ where: { productId } }),
        ]);

        return { data, total, page, limit, productName: product.name };
    }

    // ── checkAndAlertLowStock — internal, called by BillingService ───────────
    // MUST NOT throw — billing transactions must never roll back because of this.
    // After Stage 10 and Stage 13:
    //   NotificationsService.sendPush() → FCM push to admin device
    //   EmailService.sendLowStockAlert() → email alert
    checkAndAlertLowStock(
        productId: string,
        productName: string,
        currentQuantity: number,
        reorderLevel: number,
    ): boolean {
        if (currentQuantity <= reorderLevel) {
            this.logger.warn(
                `LOW STOCK ALERT: Product ${productId} has ${currentQuantity} units remaining ` +
                `(reorder level: ${reorderLevel})`,
            );
            // Fire-and-forget — never awaited, never throws
            this.inventoryGateway.emitLowStockAlert(
                productId,
                productName,
                currentQuantity,
                reorderLevel,
            );
            // Send low-stock alert email (EmailService)
            this.prisma.admin.findFirst().then(adminRecord => {
                if (adminRecord) {
                    this.emailService.sendLowStockAlert({
                        toEmail: adminRecord.email,
                        shopName: adminRecord.shopName,
                        products: [{
                            name: productName,
                            category: 'N/A',
                            currentQuantity,
                            reorderLevel
                        }],
                        generatedAt: new Date().toISOString()
                    }).catch(err => this.logger.error(`Failed to send low stock email: ${err.message}`));

                    // Send low-stock alert WhatsApp (WhatsAppService)
                    if (adminRecord.shopPhone) {
                        this.whatsappService.sendLowStockAlert({
                            adminMobile: adminRecord.shopPhone,
                            productName,
                            currentQuantity,
                            reorderLevel,
                            shopName: adminRecord.shopName
                        }).catch(err => this.logger.error(`Failed to send low stock WhatsApp: ${err.message}`));
                    }

                    // Send low-stock alert Push (NotificationsService)
                    this.notificationsService.sendLowStockPush(productName, currentQuantity)
                        .catch(err => this.logger.error(`Failed to send low stock push: ${err.message}`));
                }
            }).catch(err => this.logger.error(`Failed to fetch admin for alerts: ${err.message}`));

            return true;
        }
        return false;
    }

    // ── getInventorySummary — single aggregate query for dashboard ────────────
    //
    // This data is also used by ProductsService.getLowStock() via direct Prisma
    // queries to avoid circular dependency — InventoryService queries the DB
    // directly rather than calling ProductsService methods.
    async getInventorySummary(): Promise<InventorySummary> {
        // One query: aggregate all active products
        const agg = await this.prisma.product.aggregate({
            where: { isActive: true },
            _count: { id: true },
            _sum: {
                quantity: true,
            },
        });

        // Parallel: value totals (need row-level arithmetic → raw), out-of-stock, low-stock counts
        const [valueRows, outOfStockCount, lowStockRows] = await Promise.all([
            // totalStockValue + totalRetailValue via $queryRaw (Prisma aggregate lacks cross-column multiply)
            this.prisma.$queryRaw<
                { totalStockValue: number; totalRetailValue: number }[]
            >`
        SELECT
          COALESCE(SUM(quantity * "costPrice"), 0)::float   AS "totalStockValue",
          COALESCE(SUM(quantity * "sellingPrice"), 0)::float AS "totalRetailValue"
        FROM "Product"
        WHERE "isActive" = true
      `,
            // Out-of-stock count
            this.prisma.product.count({
                where: { isActive: true, quantity: 0 },
            }),
            // Low-stock: quantity > 0 AND quantity <= reorderLevel (cross-column → raw)
            this.prisma.$queryRaw<{ cnt: bigint }[]>`
        SELECT COUNT(*)::bigint AS cnt
        FROM "Product"
        WHERE "isActive" = true
          AND quantity > 0
          AND quantity <= "reorderLevel"
      `,
        ]);

        const totalProducts = agg._count.id;
        const { totalStockValue, totalRetailValue } = valueRows[0];
        const lowStockCount = Number(lowStockRows[0]?.cnt ?? 0);

        return {
            totalProducts,
            totalStockValue,
            totalRetailValue,
            outOfStockCount,
            lowStockCount,
        };
    }
}
