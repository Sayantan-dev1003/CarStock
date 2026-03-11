import {
    Injectable,
    ConflictException,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateProductDto) {
        const existing = await this.prisma.product.findUnique({
            where: { sku: dto.sku },
        });
        if (existing) {
            throw new ConflictException('SKU already exists');
        }
        return this.prisma.product.create({
            data: dto,
        });
    }

    async findAll(page: number, limit: number, category?: string) {
        const skip = (page - 1) * limit;
        const whereClause: any = { isActive: true };
        if (category) {
            whereClause.category = category;
        }

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.product.count({ where: whereClause }),
        ]);

        return { data, total, page, limit };
    }

    async searchByName(search: string) {
        if (!search || search.length < 2) {
            return [];
        }
        return this.prisma.product.findMany({
            where: {
                name: { contains: search, mode: 'insensitive' },
                isActive: true,
                quantity: { gt: 0 },
            },
            select: {
                id: true,
                name: true,
                sellingPrice: true,
                quantity: true,
                category: true,
            },
            take: 10,
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                stockLogs: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!product) {
            throw new NotFoundException('Product not found');
        }
        return product;
    }

    async update(id: string, dto: UpdateProductDto) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        if (dto.sku && dto.sku !== product.sku) {
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: dto.sku },
            });
            if (existingSku) {
                throw new ConflictException('SKU already exists');
            }
        }

        return this.prisma.product.update({
            where: { id },
            data: dto,
        });
    }

    async softDelete(id: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) {
            throw new NotFoundException('Product not found');
        }

        await this.prisma.product.update({
            where: { id },
            data: { isActive: false },
        });

        return { message: 'Product deactivated successfully' };
    }

    async getLowStock() {
        const activeProducts = await this.prisma.product.findMany({
            where: { isActive: true },
            select: {
                id: true,
                name: true,
                category: true,
                quantity: true,
                reorderLevel: true,
            },
        });

        return activeProducts
            .filter((p) => p.quantity <= p.reorderLevel)
            .sort((a, b) => a.quantity - b.quantity);
    }
}
