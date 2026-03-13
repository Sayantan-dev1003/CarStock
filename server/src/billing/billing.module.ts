import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { BillPdfService } from './bill-pdf.service';
import { GatewaysModule } from '../gateways/gateways.module';
import { InventoryModule } from '../inventory/inventory.module';
import { QueuesModule } from '../queues/queues.module';
import { BILL_DELIVERY_QUEUE } from '../queues/queue.constants';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: BILL_DELIVERY_QUEUE }),
    GatewaysModule,
    InventoryModule,
    QueuesModule,
    UploadModule,
    EmailModule,
    WhatsAppModule,
  ],
  controllers: [BillingController],
  providers: [BillingService, BillPdfService],
  exports: [BillingService, BillPdfService],
})
export class BillingModule {}
