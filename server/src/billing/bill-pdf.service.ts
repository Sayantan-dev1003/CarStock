import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';

// ── Typed bill shape expected by the PDF template ────────────────────────────

export interface BillForPdf {
    billNumber: string;
    createdAt: Date;
    paymentMode: string;
    subtotal: number;
    discount: number;
    cgst: number;
    sgst: number;
    total: number;
    customer: { name: string; mobile: string; email: string };
    items: {
        product: { name: string };
        quantity: number;
        unitPrice: number;
        total: number;
    }[];
}

// ── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class BillPdfService {
    private readonly logger = new Logger(BillPdfService.name);

    async generate(bill: BillForPdf): Promise<Buffer> {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();

            const date = new Date(bill.createdAt);
            const formattedDate = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

            const itemRows = bill.items
                .map(
                    (item) => `
          <tr>
            <td>${item.product.name}</td>
            <td style="text-align:center">${item.quantity}</td>
            <td style="text-align:right">₹${item.unitPrice.toFixed(2)}</td>
            <td style="text-align:right">₹${item.total.toFixed(2)}</td>
          </tr>`,
                )
                .join('');

            const discountRow =
                bill.discount > 0
                    ? `<tr><td colspan="3">Discount</td><td style="text-align:right">- ₹${bill.discount.toFixed(2)}</td></tr>`
                    : '';

            const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; font-size: 13px; color: #222; padding: 40px; }
            h1 { font-size: 22px; color: #1a1a2e; }
            .subtitle { color: #555; margin-bottom: 24px; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .meta div { line-height: 1.7; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th { background: #1a1a2e; color: #fff; padding: 10px 8px; text-align: left; }
            th:nth-child(2), th:nth-child(3), th:nth-child(4) { text-align: center; }
            th:last-child { text-align: right; }
            td { padding: 8px; border-bottom: 1px solid #e0e0e0; }
            .totals { width: 280px; margin-left: auto; margin-top: 16px; }
            .totals tr td { border: none; padding: 4px 6px; }
            .totals .grand-total td { font-weight: bold; font-size: 15px; border-top: 2px solid #1a1a2e; padding-top: 8px; }
            .footer { margin-top: 40px; text-align: center; color: #777; font-size: 12px; }
            .payment { margin-top: 16px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>CarStock Admin</h1>
          <p class="subtitle">Bill #${bill.billNumber} &nbsp;|&nbsp; Date: ${formattedDate}</p>

          <div class="meta">
            <div>
              <strong>Bill To:</strong><br/>
              ${bill.customer.name}<br/>
              ${bill.customer.mobile}<br/>
              ${bill.customer.email}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <table class="totals">
            <tbody>
              <tr><td>Subtotal</td><td style="text-align:right">₹${bill.subtotal.toFixed(2)}</td></tr>
              ${discountRow}
              <tr><td>CGST (9%)</td><td style="text-align:right">₹${bill.cgst.toFixed(2)}</td></tr>
              <tr><td>SGST (9%)</td><td style="text-align:right">₹${bill.sgst.toFixed(2)}</td></tr>
              <tr class="grand-total"><td>Total</td><td style="text-align:right">₹${bill.total.toFixed(2)}</td></tr>
            </tbody>
          </table>

          <p class="payment">Payment Mode: ${bill.paymentMode}</p>
          <p class="footer">Thank you for your purchase!</p>
        </body>
        </html>
      `;

            await page.setContent(html, { waitUntil: 'networkidle0' });

            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            this.logger.error('Failed to generate bill PDF', error);
            throw new InternalServerErrorException('Failed to generate bill PDF');
        } finally {
            // Always close — Puppeteer leak will crash the server
            await browser.close();
        }
    }
}
