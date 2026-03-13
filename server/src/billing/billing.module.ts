import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillPdfService } from './bill-pdf.service';
import { GatewaysModule } from '../gateways/gateways.module';
import { InventoryModule } from '../inventory/inventory.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [GatewaysModule, InventoryModule, EmailModule],
  controllers: [BillingController],
  providers: [BillingService, BillPdfService],
  exports: [BillingService, BillPdfService],
})
export class BillingModule {}
