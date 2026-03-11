import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillPdfService } from './bill-pdf.service';
import { GatewaysModule } from '../gateways/gateways.module';
import { InventoryModule } from '../inventory/inventory.module';

@Module({
  imports: [GatewaysModule, InventoryModule],
  controllers: [BillingController],
  providers: [BillingService, BillPdfService],
  exports: [BillingService, BillPdfService],
})
export class BillingModule {}
