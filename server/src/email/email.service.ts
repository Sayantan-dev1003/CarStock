import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { buildBillEmailHtml } from './templates/bill.template';
import { buildReminderEmailHtml } from './templates/reminder.template';
import { buildLowStockEmailHtml } from './templates/low-stock.template';
import { buildReportEmailHtml } from './templates/report.template';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail = 'onboarding@resend.dev';

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!resendApiKey) {
      this.logger.error('RESEND_API_KEY is not set in .env');
    } else {
      this.logger.log(
        `Resend initialized with key: ${resendApiKey.substring(0, 8)}...`
      );
    }

    this.resend = new Resend(resendApiKey);
  }

  async sendBill(data: {
    toEmail: string;
    customerName: string;
    billNumber: string;
    billDate: string;
    shopName: string;
    items: Array<{
      productName: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    cgst: number;
    sgst: number;
    total: number;
    paymentMode: string;
    pdfUrl: string;
  }): Promise<void> {
    try {
      this.logger.log(`Attempting to send bill email to ${data.toEmail}`);
      const html = buildBillEmailHtml(data);
      const subject = `Your Invoice from ${data.shopName} - Bill #${data.billNumber}`;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.toEmail,
        subject,
        html,
      });

      this.logger.log(
        `Bill email sent to ${data.toEmail} — ID: ${result.data?.id}`
      );
    } catch (error) {
      this.logger.error(
        `Bill email failed for ${data.toEmail}: ${JSON.stringify(error)}`
      );
    }
  }

  async sendServiceReminder(data: {
    toEmail: string;
    customerName: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    productCategory: string;
    lastPurchaseDate: string;
    shopName: string;
    shopPhone: string;
  }): Promise<void> {
    try {
      this.logger.log(
        `Attempting to send reminder email to ${data.toEmail}`
      );
      const html = buildReminderEmailHtml(data);
      const subject = `Service Reminder for your ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.toEmail,
        subject,
        html,
      });

      this.logger.log(
        `Reminder email sent to ${data.toEmail} — ID: ${result.data?.id}`
      );
    } catch (error) {
      this.logger.error(
        `Reminder email failed for ${data.toEmail}: ${JSON.stringify(error)}`
      );
    }
  }

  async sendLowStockAlert(data: {
    toEmail: string;
    shopName: string;
    products: Array<{
      name: string;
      category: string;
      currentQuantity: number;
      reorderLevel: number;
    }>;
    generatedAt: string;
  }): Promise<void> {
    try {
      this.logger.log(
        `Attempting to send low stock alert to ${data.toEmail}`
      );
      const html = buildLowStockEmailHtml(data);
      const subject = `Low Stock Alert - ${data.products.length} item(s) need restocking`;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.toEmail,
        subject,
        html,
      });

      this.logger.log(
        `Low stock email sent to ${data.toEmail} — ID: ${result.data?.id}`
      );
    } catch (error) {
      this.logger.error(
        `Low stock email failed for ${data.toEmail}: ${JSON.stringify(error)}`
      );
    }
  }

  async sendReport(data: {
    toEmail: string;
    reportType: 'Daily' | 'Weekly' | 'Monthly';
    period: string;
    shopName: string;
    totalRevenue: number;
    totalBills: number;
    newCustomers: number;
    topProduct: string;
    pdfUrl: string;
  }): Promise<void> {
    try {
      this.logger.log(
        `Attempting to send report email to ${data.toEmail}`
      );
      const html = buildReportEmailHtml(data);
      const subject = `${data.reportType} Report - ${data.shopName} - ${data.period}`;

      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: data.toEmail,
        subject,
        html,
      });

      this.logger.log(
        `Report email sent to ${data.toEmail} — ID: ${result.data?.id}`
      );
    } catch (error) {
      this.logger.error(
        `Report email failed for ${data.toEmail}: ${JSON.stringify(error)}`
      );
    }
  }
}