import { Controller, Post, Body, Get, Param, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bull';
import * as Bull from 'bull';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { BILL_DELIVERY_QUEUE, JOB_RESEND_BILL } from '../queues/queue.constants';

@ApiTags('Billing')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillingController {
  constructor(
    private readonly billingService: BillingService,
    @InjectQueue(BILL_DELIVERY_QUEUE)
    private readonly billQueue: Bull.Queue,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bill' })
  createBill(@Body() dto: CreateBillDto) {
    return this.billingService.createBill(dto);
  }

  @Get('queue-status')
  @ApiOperation({ summary: 'Get bill delivery queue status' })
  async getQueueStatus() {
    return this.billQueue.getJobCounts();
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of bills' })
  getBills(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.billingService.getBills(Number(page), Number(limit), startDate, endDate);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get bills for a specific customer' })
  getCustomerBills(
    @Param('customerId') customerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.billingService.getCustomerBills(customerId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single bill by ID' })
  getBill(@Param('id') id: string) {
    return this.billingService.getBill(id);
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Resend bill via background queue' })
  async resendBill(@Param('id') id: string) {
    // Verify the bill exists
    const bill = await this.billingService.getBill(id);
    if (!bill) {
      throw new NotFoundException('Bill not found');
    }

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
}
