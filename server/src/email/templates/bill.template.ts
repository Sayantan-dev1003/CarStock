export function buildBillEmailHtml(data: {
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
}): string {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);

    const itemsHtml = data.items
        .map(
            (item, index) => `
    <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#f8f8f8'};">
      <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.productName}</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.unitPrice)}</td>
      <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">${formatCurrency(item.total)}</td>
    </tr>
  `
        )
        .join('');

    const discountRow =
        data.discount > 0
            ? `
    <tr>
      <td colspan="3" style="padding: 8px; text-align: right; color: #4b5563;">Discount:</td>
      <td style="padding: 8px; text-align: right; color: #4b5563;">-${formatCurrency(data.discount)}</td>
    </tr>
  `
            : '';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice from ${data.shopName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f3f4f6; color: #111827;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #e23744; padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">${data.shopName}</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Tax Invoice</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Dear ${data.customerName},</h2>
                  <p style="margin: 0 0 32px 0; color: #4b5563; line-height: 1.6;">Your purchase has been confirmed. Please find your invoice details below.</p>
                  
                  <!-- Bill Info -->
                  <div style="margin-bottom: 32px; padding: 20px; background-color: #f9fafb; border-radius: 6px; border: 1px solid #e5e7eb;">
                    <table style="width: 100%; font-size: 14px;">
                      <tr>
                        <td style="color: #6b7280; padding-bottom: 4px;">Bill Number</td>
                        <td style="color: #6b7280; padding-bottom: 4px; text-align: right;">Date</td>
                      </tr>
                      <tr>
                        <td style="font-weight: 600;">#${data.billNumber}</td>
                        <td style="font-weight: 600; text-align: right;">${data.billDate}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Items Table -->
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; color: #374151; font-weight: 600;">Item</th>
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #374151; font-weight: 600;">Qty</th>
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">Unit Price</th>
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right; color: #374151; font-weight: 600;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsHtml}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="3" style="padding: 24px 8px 8px 8px; text-align: right; color: #4b5563;">Subtotal:</td>
                        <td style="padding: 24px 8px 8px 8px; text-align: right; color: #4b5563;">${formatCurrency(data.subtotal)}</td>
                      </tr>
                      ${discountRow}
                      <tr>
                        <td colspan="3" style="padding: 8px; text-align: right; color: #4b5563;">CGST (9%):</td>
                        <td style="padding: 8px; text-align: right; color: #4b5563;">${formatCurrency(data.cgst)}</td>
                      </tr>
                      <tr>
                        <td colspan="3" style="padding: 8px; text-align: right; color: #4b5563;">SGST (9%):</td>
                        <td style="padding: 8px; text-align: right; color: #4b5563;">${formatCurrency(data.sgst)}</td>
                      </tr>
                      <tr>
                        <td colspan="3" style="padding: 16px 8px 8px 8px; text-align: right; font-weight: 700; font-size: 18px;">Total:</td>
                        <td style="padding: 16px 8px 8px 8px; text-align: right; font-weight: 700; font-size: 18px; color: #e23744;">${formatCurrency(data.total)}</td>
                      </tr>
                    </tfoot>
                  </table>

                  <!-- Payment Mode -->
                  <div style="margin-bottom: 40px; text-align: center;">
                    <span style="display: inline-block; padding: 6px 12px; background-color: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">
                      Paid via ${data.paymentMode}
                    </span>
                  </div>

                  <!-- CTA -->
                  <div style="text-align: center;">
                    <a href="${data.pdfUrl}" style="display: inline-block; padding: 16px 32px; background-color: #e23744; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px; box-shadow: 0 4px 6px -1px rgba(226, 55, 68, 0.2);">
                      Download Invoice PDF
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">Thank you for shopping with ${data.shopName}</p>
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an auto-generated email. Please do not reply.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
