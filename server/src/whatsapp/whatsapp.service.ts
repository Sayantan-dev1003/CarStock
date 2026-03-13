import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class WhatsAppService {
    private readonly logger = new Logger(WhatsAppService.name);
    private readonly client: any;
    private readonly twilioWhatsAppNumber: string;

    constructor(private configService: ConfigService) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID') || '';
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN') || '';
        this.twilioWhatsAppNumber = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER') || '';

        if (!accountSid || !authToken || !this.twilioWhatsAppNumber) {
            this.logger.error('Twilio credentials are not fully defined in environment variables');
        }

        this.client = twilio(accountSid, authToken);
    }

    private formatIndianNumber(mobile: string): string {
        // Strip all spaces, dashes, brackets from input
        let cleanNumber = mobile.replace(/[\s\-\(\)]/g, '');

        // Strip leading +91 or 91 if already present
        if (cleanNumber.startsWith('+91')) {
            cleanNumber = cleanNumber.substring(3);
        } else if (cleanNumber.startsWith('91') && cleanNumber.length === 12) {
            cleanNumber = cleanNumber.substring(2);
        }

        // Strip leading 0 if present
        if (cleanNumber.startsWith('0')) {
            cleanNumber = cleanNumber.substring(1);
        }

        // Validate the result is exactly 10 digits
        if (cleanNumber.length !== 10 || !/^\d{10}$/.test(cleanNumber)) {
            throw new BadRequestException('Invalid mobile number format');
        }

        return `whatsapp:+91${cleanNumber}`;
    }

    async sendBill(data: {
        mobile: string;
        customerName: string;
        billNumber: string;
        total: number;
        shopName: string;
        pdfUrl: string;
    }): Promise<boolean> {
        try {
            const formattedNumber = this.formatIndianNumber(data.mobile);

            const messageBody = `🧾 *Bill from ${data.shopName}*

Hi ${data.customerName},

Your purchase has been confirmed!

Bill No: ${data.billNumber}
Amount: ₹${data.total.toFixed(2)}

Download your invoice:
${data.pdfUrl}

Thank you for your purchase! 🚗`;

            await this.client.messages.create({
                from: this.twilioWhatsAppNumber,
                to: formattedNumber,
                body: messageBody,
            });

            this.logger.log(`WhatsApp bill sent to ${formattedNumber} for bill ${data.billNumber}`);
            return true;
        } catch (error) {
            this.logger.error(`WhatsApp bill delivery failed for ${data.billNumber}: ${error.message}`);
            return false;
        }
    }

    async sendServiceReminder(data: {
        mobile: string;
        customerName: string;
        vehicleMake: string;
        vehicleModel: string;
        vehicleYear: number;
        productCategory: string;
        lastPurchaseDate: string;
        shopName: string;
        shopPhone: string;
    }): Promise<boolean> {
        try {
            const formattedNumber = this.formatIndianNumber(data.mobile);

            const messageBody = `🔧 *Service Reminder from ${data.shopName}*

Hi ${data.customerName},

Your ${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel} is due for a check-up!

Your ${data.productCategory} were last serviced on ${data.lastPurchaseDate}.

📞 Call us: ${data.shopPhone}

We look forward to seeing you!`;

            await this.client.messages.create({
                from: this.twilioWhatsAppNumber,
                to: formattedNumber,
                body: messageBody,
            });

            this.logger.log(`WhatsApp service reminder sent to ${formattedNumber}`);
            return true;
        } catch (error) {
            this.logger.error(`WhatsApp service reminder delivery failed: ${error.message}`);
            return false;
        }
    }

    async sendLowStockAlert(data: {
        adminMobile: string;
        productName: string;
        currentQuantity: number;
        reorderLevel: number;
        shopName: string;
    }): Promise<boolean> {
        try {
            const formattedNumber = this.formatIndianNumber(data.adminMobile);

            const messageBody = `⚠️ *Low Stock Alert - ${data.shopName}*

Product: ${data.productName}
Current Stock: ${data.currentQuantity} units
Reorder Level: ${data.reorderLevel} units

Please reorder soon to avoid stockouts.`;

            await this.client.messages.create({
                from: this.twilioWhatsAppNumber,
                to: formattedNumber,
                body: messageBody,
            });

            this.logger.log(`WhatsApp low stock alert sent to ${formattedNumber}`);
            return true;
        } catch (error) {
            this.logger.error(`WhatsApp low stock alert delivery failed: ${error.message}`);
            return false;
        }
    }
}
