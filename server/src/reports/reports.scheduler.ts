import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { ReportPdfService } from './report-pdf.service';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsScheduler {
    private readonly logger = new Logger(ReportsScheduler.name);

    constructor(
        private readonly reportsService: ReportsService,
        private readonly reportPdfService: ReportPdfService,
        private readonly uploadService: UploadService,
        private readonly emailService: EmailService,
        private readonly notificationsService: NotificationsService,
        private readonly prisma: PrismaService,
    ) { }

    private async generateAndSendReport(
        type: 'daily' | 'weekly' | 'monthly',
        data: any,
    ): Promise<void> {
        try {
            const pdfBuffer = await this.reportPdfService.generate(type, data);
            const pdfUrl = await this.uploadService.uploadPdf(
                pdfBuffer,
                `${type}-report-${Date.now()}`,
            );
            // Uploaded to Cloudinary

            const admin = await this.prisma.admin.findFirst();
            if (!admin) return;

            await this.emailService.sendReport({
                toEmail: admin.email,
                reportType: (type.charAt(0).toUpperCase() + type.slice(1)) as any,
                period: data.date || data.weekStart || `${data.month}/${data.year}`,
                shopName: admin.shopName,
                totalRevenue: data.totalRevenue,
                totalBills: data.totalBills,
                newCustomers: data.newCustomers,
                topProduct: data.topProducts?.[0]?.name || 'N/A',
                pdfUrl,
            });

            await this.notificationsService.sendPush({
                title: `📊 ${type.toUpperCase()} Report Ready`,
                body: `Revenue: ₹${data.totalRevenue.toFixed(2)} | Bills: ${data.totalBills}`,
                data: { type: 'REPORT', reportType: type },
            });

            this.logger.log(`${type} report generated and sent`);
        } catch (error) {
            this.logger.error(`Failed to execute scheduled ${type} report`, error);
        }
    }

    @Cron('0 21 * * *', {
        name: 'daily-report',
        timeZone: 'Asia/Kolkata',
    })
    async sendDailyReport(): Promise<void> {
        this.logger.log('Daily report cron triggered');
        try {
            const data = await this.reportsService.getDailyData();
            await this.generateAndSendReport('daily', data);
            await this.notificationsService.sendEodSummaryIfNeeded();
        } catch (error) {
            this.logger.error('Error in daily report cron', error);
        }
    }

    @Cron('0 20 * * 0', {
        name: 'weekly-report',
        timeZone: 'Asia/Kolkata',
    })
    async sendWeeklyReport(): Promise<void> {
        this.logger.log('Weekly report cron triggered');
        try {
            const data = await this.reportsService.getWeeklyData();
            await this.generateAndSendReport('weekly', data);
        } catch (error) {
            this.logger.error('Error in weekly report cron', error);
        }
    }

    @Cron('0 19 1 * *', {
        name: 'monthly-report',
        timeZone: 'Asia/Kolkata',
    })
    async sendMonthlyReport(): Promise<void> {
        this.logger.log('Monthly report cron triggered');
        try {
            const data = await this.reportsService.getMonthlyData();
            await this.generateAndSendReport('monthly', data);
        } catch (error) {
            this.logger.error('Error in monthly report cron', error);
        }
    }
}
