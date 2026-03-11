import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
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
import { BillingService, PaginatedBills } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import {
    BILL_DELIVERY_QUEUE,
    JOB_RESEND_BILL,
} from '../queues/queue.constants';

@ApiTags('Billing')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillingController {
    constructor(
        private readonly billingService: BillingService,
        @InjectQueue(BILL_DELIVERY_QUEUE) private readonly billQueue: Queue,
    ) { }

    // ── POST /bills — create bill (most critical endpoint) ────────────────────
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a bill — deducts stock and records sale atomically' })
    createBill(@Body() dto: CreateBillDto) {
        return this.billingService.createBill(dto);
    }

    // ── GET /bills ─────────────────────────────────────────────────────────────
    @Get()
    @ApiOperation({ summary: 'Get all bills paginated, optionally filtered by date range' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01T00:00:00.000Z' })
    @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31T23:59:59.999Z' })
    getBills(
        @Query('page') page = '1',
        @Query('limit') limit = '20',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ): Promise<PaginatedBills> {
        return this.billingService.getBills(
            parseInt(page, 10),
            parseInt(limit, 10),
            startDate,
            endDate,
        );
    }

    // ── GET /bills/customer/:customerId — MUST be before /bills/:id ───────────
    @Get('customer/:customerId')
    @ApiOperation({ summary: 'Get all bills for a specific customer (paginated)' })
    @ApiParam({ name: 'customerId', description: 'Customer UUID' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    getCustomerBills(
        @Param('customerId') customerId: string,
        @Query('page') page = '1',
        @Query('limit') limit = '20',
    ): Promise<PaginatedBills> {
        return this.billingService.getCustomerBills(
            customerId,
            parseInt(page, 10),
            parseInt(limit, 10),
        );
    }

    // ── GET /bills/:id ─────────────────────────────────────────────────────────
    @Get(':id')
    @ApiOperation({ summary: 'Get a single bill with all items and product details' })
    @ApiParam({ name: 'id', description: 'Bill UUID' })
    getBill(@Param('id') id: string) {
        return this.billingService.getBill(id);
    }

    // ── POST /bills/:id/resend — wired now, completed in Stage 12 ─────────────
    @Post(':id/resend')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary:
            'Resend bill via email and WhatsApp. ' +
            'Route wired now — email/WhatsApp integration completes in Stage 12.',
    })
    @ApiParam({ name: 'id', description: 'Bill UUID' })
    async resendBill(@Param('id') id: string) {
        // Verify bill exists
        await this.billingService.getBill(id);

        await this.billQueue.add(
            JOB_RESEND_BILL,
            { billId: id },
            {
                attempts: 2,
                backoff: {
                    type: 'fixed',
                    delay: 3000,
                },
            },
        );

        return {
            message: 'Bill resend queued successfully',
            billId: id,
        };
    }

    // ── GET /bills/queue-status ──────────────────────────────────────────────
    @Get('queue/status')
    @ApiOperation({ summary: 'Get background delivery queue status' })
    async getQueueStatus() {
        const counts = await this.billQueue.getJobCounts();
        return counts;
    }
}
