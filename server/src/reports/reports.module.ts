import { Module, Global } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { ReportPdfService } from './report-pdf.service';
import { ReportsScheduler } from './reports.scheduler';
import { ReportsController } from './reports.controller';
import { UploadModule } from '../upload/upload.module';
import { EmailModule } from '../email/email.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';

@Global()
@Module({
    imports: [
        ScheduleModule.forRoot(),
        UploadModule,
        EmailModule,
        NotificationsModule,
        PrismaModule,
    ],
    controllers: [ReportsController],
    providers: [ReportsService, ReportPdfService, ReportsScheduler],
    exports: [ReportsService, ReportPdfService],
})
export class ReportsModule { }
