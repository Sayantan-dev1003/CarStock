import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByMobile(mobile: string) {
    return this.prisma.customer.findUnique({
      where: { mobile },
      include: {
        vehicles: true,
      },
    });
  }

  async create(dto: CreateCustomerDto) {
    const existingCustomer = await this.findByMobile(dto.mobile);
    if (existingCustomer) {
      throw new ConflictException('Customer with this mobile number already exists');
    }

    return this.prisma.customer.create({
      data: dto,
    });
  }

  async findAll(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      tag: { not: 'INACTIVE' },
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { vehicles: true }
          },
          bills: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true }
          }
        }
      }),
      this.prisma.customer.count({ where }),
    ]);

    const formattedData = data.map(customer => {
      const { _count, bills, ...rest } = customer;
      return {
        ...rest,
        vehicleCount: _count.vehicles,
        lastBillDate: bills.length > 0 ? bills[0].createdAt : null,
      };
    });

    return {
      data: formattedData,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        bills: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            items: {
              include: {
                product: { select: { name: true } }
              }
            }
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (dto.mobile && dto.mobile !== customer.mobile) {
      const existingMobile = await this.prisma.customer.findUnique({
        where: { mobile: dto.mobile }
      });
      if (existingMobile) {
        throw new ConflictException('Customer with this mobile number already exists');
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async updateTotalSpend(customerId: string, amount: number, tx: Prisma.TransactionClient) {
    return tx.customer.update({
      where: { id: customerId },
      data: {
        totalSpend: {
          increment: amount,
        },
      },
    });
  }
}
