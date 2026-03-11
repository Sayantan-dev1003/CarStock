import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sgMail from '@sendgrid/mail';
import { buildBillEmailHtml } from './templates/bill.template';
import { buildReminderEmailHtml } from './templates/reminder.template';
import { buildLowStockEmailHtml } from './templates/low-stock.template';
import { buildReportEmailHtml } from './templates/report.template';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
        if (!apiKey) {
            this.logger.error('SENDGRID_API_KEY is not defined in environment variables');
        } else {
            sgMail.setApiKey(apiKey);
        }
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
        const html = buildBillEmailHtml(data);
        const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'billing@mail.yourshop.com';

        try {
            await sgMail.send({
                to: data.toEmail,
                from: fromEmail,
                subject: `Your Invoice from ${data.shopName} - Bill #${data.billNumber}`,
                html: html,
            });
            this.logger.log(`Bill email sent to ${data.toEmail} for bill ${data.billNumber}`);
        } catch (error) {
            this.logger.error(`Failed to send bill email to ${data.toEmail}: ${error.message}`);
            throw new InternalServerErrorException('Failed to send bill email');
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
        const html = buildReminderEmailHtml(data);
        const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'billing@mail.yourshop.com';

        try {
            await sgMail.send({
                to: data.toEmail,
                from: fromEmail,
                subject: `Service Reminder for your ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}`,
                html: html,
            });
            this.logger.log(`Service reminder email sent to ${data.toEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send service reminder email to ${data.toEmail}: ${error.message}`);
            throw new InternalServerErrorException('Failed to send service reminder email');
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
        const html = buildLowStockEmailHtml(data);
        const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'billing@mail.yourshop.com';

        try {
            await sgMail.send({
                to: data.toEmail,
                from: fromEmail,
                subject: `Low Stock Alert - ${data.products.length} item(s) need restocking`,
                html: html,
            });
            this.logger.log(`Low stock alert email sent to admin: ${data.toEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send low stock alert email: ${error.message}`);
            throw new InternalServerErrorException('Failed to send low stock alert email');
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
        const html = buildReportEmailHtml(data);
        const fromEmail = this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'billing@mail.yourshop.com';

        try {
            await sgMail.send({
                to: data.toEmail,
                from: fromEmail,
                subject: `${data.reportType} Report - ${data.shopName} - ${data.period}`,
                html: html,
            });
            this.logger.log(`${data.reportType} report email sent to ${data.toEmail}`);
        } catch (error) {
            this.logger.error(`Failed to send report email: ${error.message}`);
            throw new InternalServerErrorException('Failed to send report email');
        }
    }
}
