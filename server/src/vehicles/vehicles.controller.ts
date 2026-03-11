import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CAR_DATA } from '../constants/car-data';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehiclesService } from './vehicles.service';

@ApiTags('Vehicles')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehiclesController {
    constructor(private readonly vehiclesService: VehiclesService) { }

    // ── POST /vehicles ─────────────────────────────────────────────────────────
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary:
            'Add a vehicle (with number plate). ' +
            'A customer can have unlimited vehicles. ' +
            'Called from customer detail screen and from billing flow.',
    })
    create(@Body() dto: CreateVehicleDto) {
        return this.vehiclesService.create(dto);
    }

    // ── GET /vehicles/car-data — MUST be first (static, no param) ─────────────
    @Get('car-data')
    @ApiOperation({
        summary:
            'Returns all car makes and their models as a JSON object. ' +
            'Mobile app calls this once on startup and caches locally ' +
            'to populate make/model pickers.',
    })
    getCarData(): Record<string, string[]> {
        return CAR_DATA;
    }

    // ── GET /vehicles/customer/:customerId — BEFORE /:id ──────────────────────
    @Get('customer/:customerId')
    @ApiOperation({
        summary:
            'Get all vehicles for a customer with purchase-log count per vehicle',
    })
    @ApiParam({ name: 'customerId', description: 'Customer UUID' })
    findByCustomer(@Param('customerId') customerId: string) {
        return this.vehiclesService.findByCustomer(customerId);
    }

    // ── GET /vehicles/:id ──────────────────────────────────────────────────────
    @Get(':id')
    @ApiOperation({
        summary: 'Get full vehicle detail with customer info and purchase history',
    })
    @ApiParam({ name: 'id', description: 'Vehicle UUID' })
    findOne(@Param('id') id: string) {
        return this.vehiclesService.findOne(id);
    }

    // ── PATCH /vehicles/:id ────────────────────────────────────────────────────
    @Patch(':id')
    @ApiOperation({
        summary:
            'Update vehicle details (make, model, year, fuelType, regNumber). ' +
            'customerId cannot be changed.',
    })
    @ApiParam({ name: 'id', description: 'Vehicle UUID' })
    update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
        return this.vehiclesService.update(id, dto);
    }

    // ── DELETE /vehicles/:id ───────────────────────────────────────────────────
    @Delete(':id')
    @ApiOperation({
        summary:
            'Remove a vehicle. Blocked if any purchase logs exist ' +
            '(service reminder history must be preserved).',
    })
    @ApiParam({ name: 'id', description: 'Vehicle UUID' })
    remove(@Param('id') id: string) {
        return this.vehiclesService.remove(id);
    }
}
