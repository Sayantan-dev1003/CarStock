import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BillingService } from './billing.service';
import { CreateBillDto } from './dto/create-bill.dto';

@ApiTags('Billing')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('bills')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bill' })
  createBill(@Body() dto: CreateBillDto) {
    return this.billingService.createBill(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated list of bills' })
  getBills(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    return this.billingService.getBills(Number(page), Number(limit), startDate, endDate);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get bills for a specific customer' })
  getCustomerBills(
    @Param('customerId') customerId: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    return this.billingService.getCustomerBills(customerId, Number(page), Number(limit));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single bill by ID' })
  getBill(@Param('id') id: string) {
    return this.billingService.getBill(id);
  }

  @Post(':id/resend')
  @ApiOperation({ summary: 'Resend bill (available after Stage 12)' })
  resendBill(@Param('id') id: string) {
    return { message: 'Resend functionality will be available after Stage 12' };
  }
}
