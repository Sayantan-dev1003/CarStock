import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BillingModule } from '../billing/billing.module';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { BillDeliveryProcessor } from './bill-delivery.processor';
import { ReportProcessor } from './report.processor';
import { ReportsModule } from '../reports/reports.module';
import {
  BILL_DELIVERY_QUEUE,
  REPORT_GENERATION_QUEUE,
} from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: BILL_DELIVERY_QUEUE },
      { name: REPORT_GENERATION_QUEUE },
    ),
    forwardRef(() => BillingModule),
    forwardRef(() => ReportsModule),
    UploadModule,
    EmailModule,
    WhatsAppModule,
  ],
  providers: [BillDeliveryProcessor, ReportProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
