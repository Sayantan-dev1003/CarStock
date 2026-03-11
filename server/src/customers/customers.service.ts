import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Customer, Vehicle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

// ── Response shapes ──────────────────────────────────────────────────────────

export interface CustomerWithVehicles extends Customer {
    vehicles: Vehicle[];
}

export interface PaginatedCustomers {
    data: CustomerListItem[];
    total: number;
    page: number;
    limit: number;
}

export interface CustomerListItem {
    id: string;
    name: string;
    mobile: string;
    email: string;
    tag: string;
    totalSpend: number;
    vehicleCount: number;
    lastBillDate: Date | null;
    createdAt: Date;
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    // ── findByMobile — returns null instead of throwing (critical for billing) ──
    async findByMobile(mobile: string): Promise<CustomerWithVehicles | null> {
        return this.prisma.customer.findUnique({
            where: { mobile },
            include: { vehicles: true },
        });
    }

    // ── create ─────────────────────────────────────────────────────────────────
    async create(dto: CreateCustomerDto): Promise<Customer> {
        const existing = await this.findByMobile(dto.mobile);
        if (existing) {
            throw new ConflictException(
                'Customer with this mobile number already exists',
            );
        }
        return this.prisma.customer.create({ data: dto });
    }

    // ── findAll (paginated, with vehicle count + last bill date) ───────────────
    async findAll(
        page: number,
        limit: number,
        search?: string,
    ): Promise<PaginatedCustomers> {
        const where: Prisma.CustomerWhereInput = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { mobile: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};

        const [customers, total] = await this.prisma.$transaction([
            this.prisma.customer.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    vehicles: { select: { id: true } },
                    bills: {
                        select: { createdAt: true },
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                    },
                },
            }),
            this.prisma.customer.count({ where }),
        ]);

        const data: CustomerListItem[] = customers.map((c) => ({
            id: c.id,
            name: c.name,
            mobile: c.mobile,
            email: c.email,
            tag: c.tag,
            totalSpend: c.totalSpend,
            vehicleCount: c.vehicles.length,
            lastBillDate: c.bills[0]?.createdAt ?? null,
            createdAt: c.createdAt,
        }));

        return { data, total, page, limit };
    }

    // ── findOne — full detail with vehicles + last 20 bills ───────────────────
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
                                product: { select: { id: true, name: true, sku: true } },
                            },
                        },
                    },
                },
            },
        });

        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        return customer;
    }

    // ── update ─────────────────────────────────────────────────────────────────
    async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.prisma.customer.findUnique({ where: { id } });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        // If mobile is changing, make sure no other customer owns the new number
        if (dto.mobile && dto.mobile !== customer.mobile) {
            const mobileTaken = await this.prisma.customer.findUnique({
                where: { mobile: dto.mobile },
            });
            if (mobileTaken) {
                throw new ConflictException(
                    'Customer with this mobile number already exists',
                );
            }
        }

        return this.prisma.customer.update({ where: { id }, data: dto });
    }

    // ── addVehicle — adds a vehicle (with number plate) to a customer ──────────
    async addVehicle(customerId: string, dto: CreateVehicleDto): Promise<Vehicle> {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }
        return this.prisma.vehicle.create({
            data: { ...dto, customerId },
        });
    }

    // ── updateTotalSpend — called inside a billing $transaction ───────────────
    // tx is the Prisma transaction client passed from BillingService
    async updateTotalSpend(
        customerId: string,
        amount: number,
        tx: Prisma.TransactionClient,
    ): Promise<void> {
        await tx.customer.update({
            where: { id: customerId },
            data: { totalSpend: { increment: amount } },
        });
    }
}
