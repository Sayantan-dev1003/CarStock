import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { ReportPdfService } from './report-pdf.service';
import { ReportsController } from './reports.controller';
import { ReportsScheduler } from './reports.scheduler';
import { PrismaModule } from '../prisma/prisma.module';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    UploadModule,
    EmailModule,
    NotificationsModule,
  ],
  controllers: [ReportsController],
  providers: [ReportsService, ReportPdfService, ReportsScheduler],
  exports: [ReportsService, ReportPdfService],
})
export class ReportsModule {}
