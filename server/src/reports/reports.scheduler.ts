import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from './reports.service';
import { ReportPdfService } from './report-pdf.service';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { WeeklyReportData, MonthlyReportData } from './interfaces/report-data';

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
  ) {}

  @Cron('59 23 * * *', { timeZone: 'Asia/Kolkata' }) // Daily 11:59 PM
  async handleDailyReport() {
    this.logger.log('Starting daily report generation cron job...');
    try {
      const data = await this.reportsService.getDailyData();
      await this.generateAndSendReport('daily', data);
      
      // Also send EOD summary if needed (from Stage 13 requirements)
      await this.notificationsService.sendEodSummaryIfNeeded();
      
      this.logger.log('Daily report cron job completed successfully.');
    } catch (error) {
      this.logger.error(`Error in daily report cron: ${error.message}`);
    }
  }

  @Cron('59 23 * * 0', { timeZone: 'Asia/Kolkata' }) // Weekly (Sunday) 11:59 PM
  async handleWeeklyReport() {
    this.logger.log('Starting weekly report generation cron job...');
    try {
      const data = await this.reportsService.getWeeklyData();
      await this.generateAndSendReport('weekly', data);
      this.logger.log('Weekly report cron job completed successfully.');
    } catch (error) {
      this.logger.error(`Error in weekly report cron: ${error.message}`);
    }
  }

  @Cron('59 23 28-31 * *', { timeZone: 'Asia/Kolkata' }) // Monthly (Last day candidate)
  async handleMonthlyReport() {
    // Check if it's the last day of the month
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    if (tomorrow.getDate() !== 1) {
      return; // Not the last day of the month
    }

    this.logger.log('Starting monthly report generation cron job...');
    try {
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const data = await this.reportsService.getMonthlyData(month, year);
      await this.generateAndSendReport('monthly', data);
      this.logger.log('Monthly report cron job completed successfully.');
    } catch (error) {
      this.logger.error(`Error in monthly report cron: ${error.message}`);
    }
  }

  private async generateAndSendReport(
    type: 'daily' | 'weekly' | 'monthly',
    data: any,
  ) {
    const pdfBuffer = await this.reportPdfService.generate(type, data);
    const pdfUrl = await this.uploadService.uploadPdf(
      pdfBuffer,
      `auto-${type}-report-${Date.now()}`,
    );

    const admin = await this.prisma.admin.findFirst();
    if (!admin) {
      this.logger.error('Admin not found in scheduler');
      return;
    }

    let period = '';
    if (type === 'daily') {
      period = data.date;
    } else if (type === 'weekly') {
      period = (data as WeeklyReportData).weekStart;
    } else {
      period = `${(data as MonthlyReportData).month}/${(data as MonthlyReportData).year}`;
    }

    await this.emailService.sendReport({
      toEmail: admin.email,
      reportType: type as any,
      period,
      shopName: admin.shopName,
      totalRevenue: data.totalRevenue,
      totalBills: data.totalBills,
      newCustomers: data.newCustomers,
      topProduct: data.topProducts?.[0]?.name ?? 'N/A',
      pdfUrl,
    });

    await this.notificationsService.sendPush({
      title: `📊 Scheduled ${type.charAt(0).toUpperCase() + type.slice(1)} Report Ready`,
      body: `Your scheduled ${type} report is ready and has been sent to your email.`,
      data: { type: 'REPORT', reportType: type },
    });
  }
}
