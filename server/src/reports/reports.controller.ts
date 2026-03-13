import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { ReportPdfService } from './report-pdf.service';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { IsEnum, IsOptional, IsISO8601 } from 'class-validator';
import { WeeklyReportData, MonthlyReportData } from './interfaces/report-data';

export class GenerateReportDto {
  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] })
  @IsEnum(['daily', 'weekly', 'monthly'])
  type: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ required: false, example: '2024-03-20' })
  @IsOptional()
  @IsISO8601()
  date?: string;
}

@ApiTags('Reports')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  private readonly logger = new Logger(ReportsController.name);

  constructor(
    private readonly reportsService: ReportsService,
    private readonly reportPdfService: ReportPdfService,
    private readonly uploadService: UploadService,
    private readonly emailService: EmailService,
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate report and send to admin email' })
  async generateReport(@Body() dto: GenerateReportDto) {
    const reportDate = dto.date ? new Date(dto.date) : new Date();
    let data: any;

    if (dto.type === 'daily') {
      data = await this.reportsService.getDailyData(reportDate);
    } else if (dto.type === 'weekly') {
      data = await this.reportsService.getWeeklyData(reportDate);
    } else {
      data = await this.reportsService.getMonthlyData(
        reportDate.getMonth() + 1,
        reportDate.getFullYear(),
      );
    }

    const pdfBuffer = await this.reportPdfService.generate(dto.type, data);
    const pdfUrl = await this.uploadService.uploadPdf(
      pdfBuffer,
      `${dto.type}-report-${Date.now()}`,
    );

    const admin = await this.prisma.admin.findFirst();
    if (!admin) {
      this.logger.error('Admin not found when generating report');
      return { message: 'Admin not found', pdfUrl };
    }

    // Determine period string for email
    let period = '';
    if (dto.type === 'daily') {
      period = data.date;
    } else if (dto.type === 'weekly') {
      period = (data as WeeklyReportData).weekStart;
    } else {
      period = `${(data as MonthlyReportData).month}/${(data as MonthlyReportData).year}`;
    }

    await this.emailService.sendReport({
      toEmail: admin.email,
      reportType: dto.type as any,
      period,
      shopName: admin.shopName,
      totalRevenue: data.totalRevenue,
      totalBills: data.totalBills,
      newCustomers: data.newCustomers,
      topProduct: data.topProducts?.[0]?.name ?? 'N/A',
      pdfUrl,
    });

    await this.notificationsService.sendPush({
      title: `📊 ${dto.type.charAt(0).toUpperCase() + dto.type.slice(1)} Report Ready`,
      body: `Your ${dto.type} report has been generated and sent to your email.`,
      data: { type: 'REPORT', reportType: dto.type },
    });

    return {
      message: `${dto.type} report generated and sent to ${admin.email}`,
      pdfUrl,
    };
  }

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard summary data for today' })
  async getDashboardSummary() {
    const data = await this.reportsService.getDailyData();
    return {
      todayRevenue: data.totalRevenue,
      todayBills: data.totalBills,
      todayNewCustomers: data.newCustomers,
      lowStockCount: data.lowStockItems.length,
      lowStockItems: data.lowStockItems.slice(0, 5),
      paymentBreakdown: data.paymentBreakdown,
      topProducts: data.topProducts.slice(0, 3),
    };
  }
}
