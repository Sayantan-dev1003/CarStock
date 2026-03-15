import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { BillingModule } from '../billing/billing.module';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';
import { WhatsAppModule } from '../whatsapp/whatsapp.module';
import { BillDeliveryProcessor } from './bill-delivery.processor';
import { BillProcessor } from './bill-processing.processor';
import { ReportProcessor } from './report.processor';
import { ReportsModule } from '../reports/reports.module';
import { RedisModule } from '../redis/redis.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  BILL_DELIVERY_QUEUE,
  BILL_PROCESSING_QUEUE,
  REPORT_GENERATION_QUEUE,
} from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: BILL_DELIVERY_QUEUE },
      { name: BILL_PROCESSING_QUEUE },
      { name: REPORT_GENERATION_QUEUE },
    ),
    forwardRef(() => BillingModule),
    forwardRef(() => ReportsModule),
    UploadModule,
    EmailModule,
    WhatsAppModule,
    RedisModule,
    NotificationsModule,
  ],
  providers: [BillDeliveryProcessor, BillProcessor, ReportProcessor],
  exports: [BullModule],
})
export class QueuesModule {}
