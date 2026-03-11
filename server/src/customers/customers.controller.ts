import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService, CustomerWithVehicles } from './customers.service';
import { RemindersService } from '../reminders/reminders.service';

interface MobileLookupResponse {
    found: boolean;
    customer: CustomerWithVehicles | null;
}

@ApiTags('Customers')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly remindersService: RemindersService,
    ) { }

    // ── POST /customers ────────────────────────────────────────────────────────
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new customer' })
    create(@Body() dto: CreateCustomerDto) {
        return this.customersService.create(dto);
    }

    // ── GET /customers ─────────────────────────────────────────────────────────
    @Get()
    @ApiOperation({ summary: 'Get all customers (paginated, searchable)' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiQuery({ name: 'search', required: false, example: 'Arjun' })
    findAll(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('search') search?: string,
    ) {
        return this.customersService.findAll(
            parseInt(page, 10),
            parseInt(limit, 10),
            search,
        );
    }

    // ── GET /customers/mobile/:number — MUST be before /customers/:id ──────────
    @Get('mobile/:number')
    @ApiOperation({
        summary:
            'Look up customer by mobile number — used by billing screen. ' +
            'Returns { found: boolean, customer: object | null }',
    })
    @ApiParam({ name: 'number', example: '9876543210' })
    async findByMobile(
        @Param('number') number: string,
    ): Promise<MobileLookupResponse> {
        const customer = await this.customersService.findByMobile(number);
        return { found: customer !== null, customer };
    }

    // ── GET /customers/:id ─────────────────────────────────────────────────────
    @Get(':id')
    @ApiOperation({ summary: 'Get full customer profile with vehicles and bills' })
    @ApiParam({ name: 'id', description: 'Customer UUID' })
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    // ── PATCH /customers/:id ───────────────────────────────────────────────────
    @Patch(':id')
    @ApiOperation({ summary: 'Update customer details or tag' })
    @ApiParam({ name: 'id', description: 'Customer UUID' })
    update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.customersService.update(id, dto);
    }

    // ── POST /customers/:id/vehicles — add vehicle (supports multiple per customer)
    @Post(':id/vehicles')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary:
            'Add a vehicle (with number plate) to a customer. ' +
            'A customer can have any number of vehicles.',
    })
    @ApiParam({ name: 'id', description: 'Customer UUID' })
    addVehicle(
        @Param('id') customerId: string,
        @Body() dto: CreateVehicleDto,
    ) {
        return this.customersService.addVehicle(customerId, dto);
    }

    // ── POST /customers/:id/send-reminder ──────────────────────────────────────
    @Post(':id/send-reminder')
    @ApiOperation({
        summary: 'Send a service reminder to this customer from their profile screen',
    })
    @ApiParam({ name: 'id', description: 'Customer UUID' })
    sendReminder(@Param('id') id: string) {
        return this.remindersService.triggerManualReminder(id);
    }
}
