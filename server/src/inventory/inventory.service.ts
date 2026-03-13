import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InventoryGateway } from '../gateways/inventory.gateway';
import { EmailService } from '../email/email.service';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly inventoryGateway: InventoryGateway,
    private readonly emailService: EmailService
  ) {}

  async addStock(dto: UpdateStockDto) {
    // Step A: Find the product
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.isActive) {
      throw new BadRequestException('Cannot update stock for a deactivated product');
    }

    const oldQuantity = product.quantity;

    // Step B: Increment product quantity using Prisma atomic increment
    await this.prisma.product.update({
      where: { id: dto.productId },
      data: {
        quantity: { increment: dto.quantity },
      },
    });

    // Step C: Create a StockLog entry
    const stockLog = await this.prisma.stockLog.create({
      data: {
        productId: dto.productId,
        type: 'ADD',
        quantity: dto.quantity,
        note: dto.note || null,
      },
    });

    // Step D: Fetch updated product
    const updatedProduct = await this.prisma.product.findUniqueOrThrow({
      where: { id: dto.productId },
    });

    // Step E: Check if this product was previously below reorder level
    if (oldQuantity <= updatedProduct.reorderLevel && updatedProduct.quantity > updatedProduct.reorderLevel) {
      this.logger.log(`Stock for product ${dto.productId} is healthy again. (Previous: ${oldQuantity}, New: ${updatedProduct.quantity}, Reorder Level: ${updatedProduct.reorderLevel})`);
    }

    if (updatedProduct.quantity <= updatedProduct.reorderLevel) {
       this.checkAndAlertLowStock(updatedProduct.id, updatedProduct.name, updatedProduct.category, updatedProduct.quantity, updatedProduct.reorderLevel);
    }

    this.logger.log(`Stock added: ${dto.quantity} units added to product ${dto.productId}. New quantity: ${updatedProduct.quantity}`);

    this.inventoryGateway.emitStockUpdate(
      dto.productId,
      updatedProduct.name,
      updatedProduct.quantity,
      'ADD'
    );

    return { product: updatedProduct, stockLog };
  }

  async getStockHistory(productId: string, page: number, limit: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.stockLog.findMany({
        where: { productId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          quantity: true,
          note: true,
          createdAt: true,
        },
      }),
      this.prisma.stockLog.count({
        where: { productId },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      productName: product.name,
    };
  }

  checkAndAlertLowStock(productId: string, productName: string, category: string, currentQuantity: number, reorderLevel: number): boolean {
    if (currentQuantity <= reorderLevel) {
      this.logger.warn(`LOW STOCK ALERT: Product ${productId} has ${currentQuantity} units remaining (reorder level: ${reorderLevel})`);
      
      this.inventoryGateway.emitLowStockAlert(
        productId,
        productName,
        currentQuantity,
        reorderLevel
      );

      // Stage 10: Send Low Stock Alert Email
      this.prisma.admin.findFirst().then(adminRecord => {
        if (adminRecord) {
          this.emailService.sendLowStockAlert({
            toEmail: adminRecord.email,
            shopName: adminRecord.shopName,
            products: [{
              name: productName,
              category,
              currentQuantity,
              reorderLevel
            }],
            generatedAt: new Date().toISOString()
          }).catch(err => this.logger.error(`Failed to send low stock email: ${err.message}`));
        }
      });

      return true;
    }
    return false;
  }

  async getInventorySummary() {
    const activeProducts = await this.prisma.product.findMany({
      where: { isActive: true },
      select: {
        quantity: true,
        costPrice: true,
        sellingPrice: true,
        reorderLevel: true,
      },
    });

    const totalProducts = await this.prisma.product.count({
      where: { isActive: true },
    });

    let totalStockValue = 0;
    let totalRetailValue = 0;
    let outOfStockCount = 0;
    let lowStockCount = 0;

    for (const product of activeProducts) {
      totalStockValue += (product.quantity * product.costPrice);
      totalRetailValue += (product.quantity * product.sellingPrice);

      if (product.quantity === 0) {
        outOfStockCount++;
      } else if (product.quantity <= product.reorderLevel) {
        lowStockCount++;
      }
    }

    return {
      totalProducts,
      totalStockValue,
      totalRetailValue,
      outOfStockCount,
      lowStockCount,
    };
  }
}
