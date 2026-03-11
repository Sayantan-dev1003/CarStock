export function buildReportEmailHtml(data: {
    reportType: 'Daily' | 'Weekly' | 'Monthly';
    period: string;
    shopName: string;
    totalRevenue: number;
    totalBills: number;
    newCustomers: number;
    topProduct: string;
    pdfUrl: string;
}): string {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
        }).format(amount);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${data.reportType} Report - ${data.shopName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f3f4f6; color: #111827;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a2e; padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">${data.reportType} Business Report</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 500;">${data.period} | ${data.shopName}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <!-- Stats Grid -->
                  <table style="width: 100%; border-collapse: separate; border-spacing: 12px; margin: -12px;">
                    <tr>
                      <td style="width: 50%; padding: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Total Revenue</p>
                        <p style="margin: 0; font-size: 20px; font-weight: 800; color: #10b981;">${formatCurrency(data.totalRevenue)}</p>
                      </td>
                      <td style="width: 50%; padding: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Total Bills</p>
                        <p style="margin: 0; font-size: 20px; font-weight: 800; color: #1a1a2e;">${data.totalBills}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 50%; padding: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">New Customers</p>
                        <p style="margin: 0; font-size: 20px; font-weight: 800; color: #3b82f6;">${data.newCustomers}</p>
                      </td>
                      <td style="width: 50%; padding: 24px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; font-weight: 600; text-transform: uppercase;">Top Product</p>
                        <p style="margin: 0; font-size: 16px; font-weight: 800; color: #1a1a2e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.topProduct}</p>
                      </td>
                    </tr>
                  </table>

                  <div style="margin-top: 40px; text-align: center; padding: 32px; border: 1px dashed #cbd5e1; border-radius: 12px;">
                    <p style="margin: 0 0 24px 0; color: #4b5563; line-height: 1.6;">A detailed breakdown of transactions, inventory movements, and customer insights is available in the full report PDF.</p>
                    <a href="${data.pdfUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1a1a2e; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                      Download Full Report
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">This is an automated performance report from your CarStock Admin platform.</p>
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
