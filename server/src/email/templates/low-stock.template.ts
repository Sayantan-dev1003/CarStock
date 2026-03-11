export function buildLowStockEmailHtml(data: {
    shopName: string;
    products: Array<{
        name: string;
        category: string;
        currentQuantity: number;
        reorderLevel: number;
    }>;
    generatedAt: string;
}): string {
    const productsHtml = data.products
        .map((product, index) => {
            const isOutOfStock = product.currentQuantity <= 0;
            const status = isOutOfStock ? 'OUT OF STOCK' : 'LOW STOCK';
            const statusColor = isOutOfStock ? '#ef4444' : '#f97316';
            const statusBg = isOutOfStock ? '#fee2e2' : '#ffedd5';

            return `
      <tr style="background-color: ${index % 2 === 0 ? '#ffffff' : '#fefaf8'};">
        <td style="padding: 12px; border: 1px solid #e5e7eb; font-weight: 500;">${product.name}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; color: #6b7280;">${product.category}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; font-weight: 600;">${product.currentQuantity}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #6b7280;">${product.reorderLevel}</td>
        <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">
          <span style="padding: 4px 8px; font-size: 10px; font-weight: 700; border-radius: 4px; background-color: ${statusBg}; color: ${statusColor}; text-transform: uppercase;">
            ${status}
          </span>
        </td>
      </tr>
    `;
        })
        .join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Low Stock Alert - ${data.shopName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #fffaf0; color: #111827;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 700px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #f97316; padding: 40px; text-align: center;">
                  <div style="background-color: rgba(255, 255, 255, 0.2); width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <span style="font-size: 24px; line-height: 48px; color: #ffffff;">⚠️</span>
                  </div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Low Stock Alert</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px; font-weight: 500;">${data.products.length} product(s) need restocking</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 15px;">The following items in <strong>${data.shopName}</strong> inventory have reached or fallen below their reorder levels. Please review and replenish stock as soon as possible.</p>
                  
                  <!-- Products Table -->
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                      <tr style="background-color: #f9fafb;">
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; color: #4b5563; font-weight: 700;">Product Name</th>
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left; color: #4b5563; font-weight: 700;">Category</th>
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 700;">Current</th>
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 700;">Reorder</th>
                        <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center; color: #4b5563; font-weight: 700;">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${productsHtml}
                    </tbody>
                  </table>
                  
                  <div style="margin-top: 32px; padding: 20px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px;">
                    <p style="margin: 0; font-size: 13px; color: #92400e; line-height: 1.5;">
                      <strong>Note:</strong> Auto-generated alerts help maintain optimal inventory levels. Prompt restocking prevents lost sales opportunities.
                    </p>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 12px; color: #9ca3af;">Generated at: ${data.generatedAt}</p>
                  <p style="margin: 4px 0 0 0; font-size: 12px; color: #9ca3af;">CarStock Admin Inventory Management</p>
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
