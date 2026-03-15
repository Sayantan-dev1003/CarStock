import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed, OnQueueStalled } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { BillPdfService } from '../billing/bill-pdf.service';
import { UploadService } from '../upload/upload.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../whatsapp/whatsapp.service';
import { RedisService } from '../redis/redis.service';
import { BILL_PROCESSING_QUEUE, JOB_PROCESS_BILL } from './queue.constants';

@Processor(BILL_PROCESSING_QUEUE)
@Injectable()
export class BillProcessor {
  private readonly logger = new Logger(BillProcessor.name);

  constructor(
    private prisma: PrismaService,
    private billPdfService: BillPdfService,
    private uploadService: UploadService,
    private emailService: EmailService,
    private whatsappService: WhatsAppService,
    private redisService: RedisService,
  ) {}

  @Process(JOB_PROCESS_BILL)
  async handleBillProcessing(job: Job<{ billId: string }>) {
    const { billId } = job.data;
    this.logger.log(`Processing bill ${billId}`);

    try {
      // Fetch bill with all relations needed for PDF
      const bill = await this.prisma.bill.findUniqueOrThrow({
        where: { id: billId },
        include: { 
          items: { include: { product: true } }, 
          customer: true 
        },
      });

      // Step 1: Generate PDF
      this.logger.log(`Bill ${billId}: Generating PDF...`);
      const pdfBuffer = await this.billPdfService.generate(bill);

      // Step 2: Upload to Cloudinary
      this.logger.log(`Bill ${billId}: Uploading PDF to Cloudinary...`);
      const pdfUrl = await this.uploadService.uploadPdf(pdfBuffer, bill.billNumber);

      // ✅ Immediately patch pdfUrl
      await this.prisma.bill.update({
        where: { id: billId },
        data: { pdfUrl },
      });
      this.logger.log(`Bill ${billId}: PDF uploaded → ${pdfUrl}`);

      // Step 3: Send Email
      this.logger.log(`Bill ${billId}: Sending email...`);
      await this.emailService.sendBill({
        toEmail: bill.customer.email,
        customerName: bill.customer.name,
        billNumber: bill.billNumber,
        billDate: bill.createdAt.toISOString(),
        shopName: 'CarStock', // Could fetch from Admin if needed
        items: bill.items.map((item) => ({
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: Number(item.unitPrice),
          total: Number(item.total),
        })),
        subtotal: Number(bill.subtotal),
        discount: Number(bill.discount),
        cgst: Number(bill.cgst),
        sgst: Number(bill.sgst),
        total: Number(bill.total),
        paymentMode: bill.paymentMode,
        pdfUrl: pdfUrl,
      });

      // ✅ Immediately patch emailSent
      await this.prisma.bill.update({
        where: { id: billId },
        data: { emailSent: true },
      });
      this.logger.log(`Bill ${billId}: Email sent`);

      // Step 4: Send WhatsApp
      this.logger.log(`Bill ${billId}: Sending WhatsApp...`);
      const whatsappSent = await this.whatsappService.sendBill({
        mobile: bill.customer.mobile,
        customerName: bill.customer.name,
        billNumber: bill.billNumber,
        total: Number(bill.total),
        shopName: 'CarStock',
        pdfUrl: pdfUrl,
      });

      // ✅ Immediately patch whatsappSent + mark COMPLETED
      await this.prisma.bill.update({
        where: { id: billId },
        data: { 
          whatsappSent: !!whatsappSent, 
          status: 'COMPLETED' 
        },
      });
      this.logger.log(`Bill ${billId}: WhatsApp sent → COMPLETED`);

      // Step 5: Publish completion event via Redis Pub/Sub
      await this.redisService.publish(
        'bill.completed',
        JSON.stringify({
          billId,
          billNumber: bill.billNumber,
          total: Number(bill.total),
          customerName: bill.customer.name,
          paymentMode: bill.paymentMode,
          pdfUrl,
          emailSent: true,
          whatsappSent: !!whatsappSent,
          status: 'COMPLETED',
        }),
      );

    } catch (error) {
      this.logger.error(`Bill ${billId} processing failed:`, error);

      try {
        await this.prisma.bill.update({
          where: { id: billId },
          data: { status: 'FAILED' },
        });

        await this.redisService.publish(
          'bill.failed',
          JSON.stringify({ billId, error: error.message }),
        );
      } catch (updateError) {
        this.logger.error(`Failed to update bill ${billId} status to FAILED`, updateError);
      }

      // Re-throw so Bull can retry
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`[Bull] Job ${job.id} is ACTIVE`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.log(`[Bull] Job ${job.id} COMPLETED`);
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`[Bull] Job ${job.id} FAILED:`, err.message);
  }

  @OnQueueStalled()
  onStalled(job: Job) {
    this.logger.warn(`[Bull] Job ${job.id} is STALLED`);
  }
}
