import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';

@Injectable()
export class BillPdfService {
  private readonly logger = new Logger(BillPdfService.name);

  async generate(bill: any): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();
      const dateStr = new Date(bill.createdAt || new Date()).toLocaleDateString('en-GB'); // DD/MM/YYYY

      const rows = bill.items.map(item => `
        <tr>
          <td>${item.product.name}</td>
          <td>${item.quantity}</td>
          <td>${item.unitPrice.toFixed(2)}</td>
          <td>${item.total.toFixed(2)}</td>
        </tr>
      `).join('');

      let discountRow = '';
      if (bill.discount && bill.discount > 0) {
        discountRow = `
          <tr>
            <td colspan="3" style="text-align: right;"><strong>Discount:</strong></td>
            <td>${bill.discount.toFixed(2)}</td>
          </tr>
        `;
      }

      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 40px; }
              h1 { margin-bottom: 5px; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .bill-info { text-align: right; }
              .customer-info { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
              th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
              th { background-color: #f9f9f9; }
              .footer { text-align: center; margin-top: 50px; font-style: italic; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>CarStock Accessories</h1>
                <p>123 Auto Market, Car City</p>
              </div>
              <div class="bill-info">
                <h2>INVOICE</h2>
                <p><strong>Bill No:</strong> ${bill.billNumber}</p>
                <p><strong>Date:</strong> ${dateStr}</p>
              </div>
            </div>
            
            <div class="customer-info">
              <h3>Billed To:</h3>
              <p><strong>Name:</strong> ${bill.customer.name}</p>
              <p><strong>Mobile:</strong> ${bill.customer.mobile}</p>
              ${bill.customer.email ? `<p><strong>Email:</strong> ${bill.customer.email}</p>` : ''}
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
              <tbody>
                ${rows}
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                  <td>${bill.subtotal.toFixed(2)}</td>
                </tr>
                ${discountRow}
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>CGST (9%):</strong></td>
                  <td>${bill.cgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>SGST (9%):</strong></td>
                  <td>${bill.sgst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                  <td><strong>${bill.total.toFixed(2)}</strong></td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Payment Mode:</strong></td>
                  <td>${bill.paymentMode}</td>
                </tr>
              </tbody>
            </table>

            <div class="footer">
              <p>Thank you for your purchase!</p>
            </div>
          </body>
        </html>
      `;

      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px',
        },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error('Error generating PDF', error.stack);
      throw new InternalServerErrorException('Failed to generate bill PDF');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}
