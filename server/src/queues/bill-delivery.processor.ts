import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import * as Bull from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { BillPdfService } from '../billing/bill-pdf.service';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import {
  BILL_DELIVERY_QUEUE,
  JOB_DELIVER_BILL,
  JOB_RESEND_BILL,
} from './queue.constants';

@Processor(BILL_DELIVERY_QUEUE)
export class BillDeliveryProcessor {
  private readonly logger = new Logger(BillDeliveryProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly billPdfService: BillPdfService,
    private readonly uploadService: UploadService,
    private readonly emailService: EmailService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Process(JOB_DELIVER_BILL)
  async handleDeliverBill(job: Bull.Job<{ billId: string }>) {
    this.logger.log(`Processing bill delivery job for billId: ${job.data.billId}`);

    const { billId } = job.data;

    // Step A — Fetch complete bill data
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (!bill) {
      this.logger.error(`Bill not found for delivery: ${billId}`);
      return;
    }

    // Step B — Fetch admin record
    const adminRecord = await this.prisma.admin.findFirst();
    const shopName = adminRecord?.shopName || 'CarStock';
    const shopPhone = adminRecord?.shopPhone || '';

    // Step C — Generate PDF
    let pdfBuffer: Buffer | null = null;
    try {
      pdfBuffer = await this.billPdfService.generate(bill as any);
    } catch (error) {
      this.logger.error(`PDF generation failed for bill ${bill.billNumber}: ${error.message}`);
    }

    // Step D — Upload PDF to Cloudinary
    let pdfUrl: string | null = null;
    if (pdfBuffer) {
      try {
        pdfUrl = await this.uploadService.uploadPdf(pdfBuffer, bill.billNumber);
      } catch (error) {
        this.logger.error(`Cloudinary upload failed for bill ${bill.billNumber}: ${error.message}`);
      }
    }

    // Step E — Update bill with pdfUrl
    if (pdfUrl) {
      await this.prisma.bill.update({
        where: { id: bill.id },
        data: { pdfUrl },
      });
    }

    // Step F — Send email
    let emailSent = false;
    try {
      await this.emailService.sendBill({
        toEmail: bill.customer.email,
        customerName: bill.customer.name,
        billNumber: bill.billNumber,
        billDate: new Date(bill.createdAt).toLocaleDateString('en-IN'),
        shopName,
        items: bill.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        subtotal: bill.subtotal,
        discount: bill.discount,
        cgst: bill.cgst,
        sgst: bill.sgst,
        total: bill.total,
        paymentMode: bill.paymentMode,
        pdfUrl: pdfUrl || (bill.pdfUrl ?? ''),
      });
      emailSent = true;
    } catch (error) {
      this.logger.error(`Email delivery failed for bill ${bill.billNumber}: ${error.message}`);
    }

    // Step G — Send WhatsApp
    let whatsappSent = false;
    try {
      whatsappSent = await this.whatsappService.sendBill({
        mobile: bill.customer.mobile,
        customerName: bill.customer.name,
        billNumber: bill.billNumber,
        total: bill.total,
        shopName,
        pdfUrl: pdfUrl || (bill.pdfUrl ?? ''),
      });
    } catch (error) {
      this.logger.error(`WhatsApp delivery failed for bill ${bill.billNumber}: ${error.message}`);
    }

    // Step H — Update bill delivery status
    await this.prisma.bill.update({
      where: { id: bill.id },
      data: {
        emailSent,
        whatsappSent,
        pdfUrl: pdfUrl ?? undefined,
      },
    });

    this.logger.log(
      `Bill ${bill.billNumber} delivery complete. Email: ${emailSent}, WhatsApp: ${whatsappSent}, PDF: ${
        pdfUrl ? 'uploaded to Cloudinary' : 'not generated'
      }`,
    );
  }

  @Process(JOB_RESEND_BILL)
  async handleResendBill(job: Bull.Job<{ billId: string }>) {
    this.logger.log(`Processing resend job for billId: ${job.data.billId}`);

    const { billId } = job.data;

    // Fetch the bill with customer and items
    const bill = await this.prisma.bill.findUnique({
      where: { id: billId },
      include: {
        customer: true,
        items: { include: { product: true } },
      },
    });

    if (!bill) {
      this.logger.error(`Bill not found for resend: ${billId}`);
      return;
    }

    // Fetch admin record
    const adminRecord = await this.prisma.admin.findFirst();
    const shopName = adminRecord?.shopName || 'CarStock';

    let pdfUrl = bill.pdfUrl;

    // If bill.pdfUrl exists, use it directly (permanent Cloudinary URL)
    if (!pdfUrl) {
      // Regenerate the PDF and upload to Cloudinary again
      let pdfBuffer: Buffer | null = null;
      try {
        pdfBuffer = await this.billPdfService.generate(bill as any);
        if (pdfBuffer) {
          pdfUrl = await this.uploadService.uploadPdf(pdfBuffer, bill.billNumber);
          if (pdfUrl) {
            await this.prisma.bill.update({
              where: { id: bill.id },
              data: { pdfUrl },
            });
          }
        }
      } catch (error) {
        this.logger.error(`PDF regeneration/upload failed for bill ${bill.billNumber}: ${error.message}`);
      }
    }

    // Resend email
    let emailSent = false;
    try {
      await this.emailService.sendBill({
        toEmail: bill.customer.email,
        customerName: bill.customer.name,
        billNumber: bill.billNumber,
        billDate: new Date(bill.createdAt).toLocaleDateString('en-IN'),
        shopName,
        items: bill.items.map((i) => ({
          productName: i.product.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          total: i.total,
        })),
        subtotal: bill.subtotal,
        discount: bill.discount,
        cgst: bill.cgst,
        sgst: bill.sgst,
        total: bill.total,
        paymentMode: bill.paymentMode,
        pdfUrl: pdfUrl || '',
      });
      emailSent = true;
    } catch (error) {
      this.logger.error(`Email resend failed for bill ${bill.billNumber}: ${error.message}`);
    }

    // Resend WhatsApp
    let whatsappSent = false;
    try {
      whatsappSent = await this.whatsappService.sendBill({
        mobile: bill.customer.mobile,
        customerName: bill.customer.name,
        billNumber: bill.billNumber,
        total: bill.total,
        shopName,
        pdfUrl: pdfUrl || '',
      });
    } catch (error) {
      this.logger.error(`WhatsApp resend failed for bill ${bill.billNumber}: ${error.message}`);
    }

    // Update bill record with latest delivery status
    await this.prisma.bill.update({
      where: { id: bill.id },
      data: {
        emailSent,
        whatsappSent,
      },
    });

    this.logger.log(`Bill ${bill.billNumber} resent. Email: ${emailSent}, WhatsApp: ${whatsappSent}`);
  }
}
