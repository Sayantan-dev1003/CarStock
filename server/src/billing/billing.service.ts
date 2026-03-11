import { Injectable, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InventoryGateway } from '../gateways/inventory.gateway';
import { InventoryService } from '../inventory/inventory.service';
import { BillPdfService } from './bill-pdf.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { BillItemDto } from './dto/bill-item.dto';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryGateway: InventoryGateway,
    private readonly inventoryService: InventoryService,
    private readonly billPdfService: BillPdfService
  ) {}

  private generateBillNumber(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(10000 + Math.random() * 90000).toString();
    return `BILL-${date}-${rand}`;
  }

  private calculateTotals(items: BillItemDto[], discount: number) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountedAmount = subtotal - discount;

    if (discountedAmount < 0) {
      throw new BadRequestException('Discount cannot exceed subtotal');
    }

    const cgst = discountedAmount * 0.09;
    const sgst = discountedAmount * 0.09;
    const total = discountedAmount + cgst + sgst;

    return { subtotal, cgst, sgst, total };
  }

  async createBill(dto: CreateBillDto) {
    let billWithRelations: any;
    let originalProductsArray: Product[] = [];

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Part 1: Validate all items before touching stock
      const products: Product[] = [];
      for (const item of dto.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
        if (!product.isActive) throw new BadRequestException(`Product ${product.name} is no longer active`);
        if (product.quantity < item.quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}. \n    Available: ${product.quantity}, \n    Requested: ${item.quantity}`);
        }
        products.push(product);
      }
      originalProductsArray = products;

      // Part 2: Deduct stock for each item
      const billNumber = this.generateBillNumber();
      for (let i = 0; i < dto.items.length; i++) {
        const item = dto.items[i];
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
        await tx.stockLog.create({
          data: {
             productId: item.productId,
             type: 'DEDUCT',
             quantity: item.quantity,
             note: `Sold - Bill ${billNumber}`
          }
        });
      }

      // Part 3: Calculate totals
      const totals = this.calculateTotals(dto.items, dto.discount ?? 0);

      // Part 4 is generating the bill number done above for the stock log
      // Part 5: Create Bill record with nested BillItems
      const createdBill = await tx.bill.create({
        data: {
          billNumber,
          customerId: dto.customerId,
          subtotal: totals.subtotal,
          discount: dto.discount ?? 0,
          cgst: totals.cgst,
          sgst: totals.sgst,
          total: totals.total,
          paymentMode: dto.paymentMode,
          items: {
            create: dto.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice
            }))
          }
        },
        include: {
          customer: true,
          items: { include: { product: true } }
        }
      });

      // Part 6: Update customer total spend
      await tx.customer.update({
        where: { id: dto.customerId },
        data: { totalSpend: { increment: totals.total } }
      });

      // Part 7: Create VehiclePurchaseLog if vehicleId provided
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
              purchasedAt: new Date()
            }
          });
        }
      }

      billWithRelations = createdBill;
      return createdBill;
    }, { timeout: 15000 });

    // OUTSIDE the transaction (after it resolves):
    for (let i = 0; i < dto.items.length; i++) {
        const item = dto.items[i];
        const product = originalProductsArray[i];
        const newQuantity = product.quantity - item.quantity;
        
        this.inventoryGateway.emitStockUpdate(item.productId, product.name, newQuantity, 'DEDUCT');
        
        const isLow = await this.inventoryService.checkAndAlertLowStock(item.productId, product.name, newQuantity, product.reorderLevel);
        if (isLow) {
           this.inventoryGateway.emitLowStockAlert(item.productId, product.name, newQuantity, product.reorderLevel);
        }
    }

    this.inventoryGateway.emitBillCreated(result.id, result.billNumber, result.customer.name, result.total);

    this.logger.log(`Bill ${result.billNumber} created for customer ${result.customer.name}, total: ${result.total}`);

    // TODO Stage 9: Generate PDF and upload to S3
    // TODO Stage 10: Send email
    // TODO Stage 11: Send WhatsApp

    return result;
  }

  async getBill(id: string) {
    const bill = await this.prisma.bill.findUnique({
      where: { id },
      include: {
        customer: true,
        items: { include: { product: true } }
      }
    });

    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async getBills(page: number, limit: number, startDate?: string, endDate?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { name: true } }
        }
      }),
      this.prisma.bill.count({ where })
    ]);

    // Format the data to include customerName directly for performance
    const formattedData = data.map(b => ({
       id: b.id,
       billNumber: b.billNumber,
       total: b.total,
       createdAt: b.createdAt,
       customerName: b.customer?.name || 'Unknown' 
    }));

    return { data: formattedData, total, page, limit };
  }

  async getCustomerBills(customerId: string, page: number, limit: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) throw new NotFoundException('Customer not found');

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.bill.findMany({
         where: { customerId },
         skip,
         take: limit,
         orderBy: { createdAt: 'desc' },
         include: {
           items: { include: { product: { select: { name: true } } } }
         }
      }),
      this.prisma.bill.count({ where: { customerId } })
    ]);

    return { data, total, page, limit };
  }
}
