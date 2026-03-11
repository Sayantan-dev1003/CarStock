import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma, Vehicle } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

// ── Response shapes ──────────────────────────────────────────────────────────

export interface VehicleWithCount extends Vehicle {
    _count: { purchaseLogs: number };
}

export interface VehicleDetail {
    id: string;
    customerId: string;
    make: string;
    model: string;
    year: number;
    fuelType: string | null;
    regNumber: string | null;
    createdAt: Date;
    customer: { id: string; name: string; mobile: string };
    purchaseLogs: {
        id: string;
        billId: string;
        productId: string;
        category: string;
        purchasedAt: Date;
    }[];
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class VehiclesService {
    constructor(private readonly prisma: PrismaService) { }

    // ── create — verifies customer exists first ────────────────────────────────
    async create(dto: CreateVehicleDto): Promise<Vehicle & { customer: { id: string; name: string; mobile: string } }> {
        const customer = await this.prisma.customer.findUnique({
            where: { id: dto.customerId },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        return this.prisma.vehicle.create({
            data: dto,
            include: {
                customer: { select: { id: true, name: true, mobile: true } },
            },
        });
    }

    // ── findByCustomer — all vehicles for a customer with purchaseLogs count ──
    async findByCustomer(customerId: string): Promise<VehicleWithCount[]> {
        const customer = await this.prisma.customer.findUnique({
            where: { id: customerId },
        });
        if (!customer) {
            throw new NotFoundException('Customer not found');
        }

        return this.prisma.vehicle.findMany({
            where: { customerId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { purchaseLogs: true } },
            },
        }) as Promise<VehicleWithCount[]>;
    }

    // ── findOne — full vehicle detail with customer info + all purchase logs ──
    async findOne(id: string): Promise<VehicleDetail> {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                customer: { select: { id: true, name: true, mobile: true } },
                purchaseLogs: {
                    orderBy: { purchasedAt: 'desc' },
                },
            },
        });

        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }

        return vehicle as VehicleDetail;
    }

    // ── update — only provided fields are changed ──────────────────────────────
    async update(id: string, dto: UpdateVehicleDto): Promise<Vehicle> {
        await this._assertVehicleExists(id);
        return this.prisma.vehicle.update({ where: { id }, data: dto });
    }

    // ── remove — guards against deleting vehicles with service history ─────────
    //
    // Hard delete is conditionally safe: we first check if VehiclePurchaseLogs
    // exist. If they do, deletion would orphan service-reminder history so we
    // block it. If none exist (e.g. newly added wrong vehicle), deletion is safe.
    async remove(id: string): Promise<{ message: string }> {
        await this._assertVehicleExists(id);

        const logCount = await this.prisma.vehiclePurchaseLog.count({
            where: { vehicleId: id },
        });

        if (logCount > 0) {
            throw new BadRequestException(
                `Cannot remove this vehicle — it has ${logCount} service log(s). ` +
                'Removing it would destroy purchase history used for service reminders.',
            );
        }

        await this.prisma.vehicle.delete({ where: { id } });
        return { message: 'Vehicle removed successfully' };
    }

    // ── private guard ──────────────────────────────────────────────────────────
    private async _assertVehicleExists(id: string): Promise<Vehicle> {
        const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });
        if (!vehicle) {
            throw new NotFoundException('Vehicle not found');
        }
        return vehicle;
    }
}
