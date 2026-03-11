export function buildReminderEmailHtml(data: {
    customerName: string;
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    productCategory: string;
    lastPurchaseDate: string;
    shopName: string;
    shopPhone: string;
}): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Reminder - ${data.shopName}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f3f4f6; color: #111827;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 0;">
            <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a2e; padding: 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">Time for a Service Check!</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.8); font-size: 14px; font-weight: 500;">Friendly Reminder from ${data.shopName}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 40px;">
                  <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700;">Hi ${data.customerName},</h2>
                  <p style="margin: 0 0 32px 0; color: #4b5563; line-height: 1.6;">How is your vehicle performing? We noticed it's been a while since your last visit, and we want to ensure everything is running perfectly.</p>
                  
                  <!-- Vehicle Highlight Card -->
                  <div style="margin-bottom: 32px; padding: 32px; background-color: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Vehicle</p>
                    <h3 style="margin: 0; color: #1a1a2e; font-size: 24px; font-weight: 800;">${data.vehicleYear} ${data.vehicleMake} ${data.vehicleModel}</h3>
                  </div>

                  <p style="margin: 0 0 16px 0; color: #4b5563; line-height: 1.6;">
                    Your <strong>${data.productCategory}</strong> were last serviced on <strong>${data.lastPurchaseDate}</strong>. 
                    Regular check-ups are essential to maintain performance and safety on the road.
                  </p>
                  
                  <!-- CTA Section -->
                  <div style="margin-top: 40px; text-align: center; padding: 32px; background-color: rgba(26, 26, 46, 0.03); border-radius: 12px;">
                    <h4 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 700;">Ready to schedule?</h4>
                    <p style="margin: 0 0 24px 0; color: #4b5563; font-size: 14px;">Visit us at our shop or call us directly to book your slot.</p>
                    <a href="tel:${data.shopPhone}" style="display: inline-block; padding: 14px 28px; background-color: #1a1a2e; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 6px; font-size: 14px;">
                      Call ${data.shopPhone}
                    </a>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">${data.shopName}</p>
                  <p style="margin: 0 0 16px 0; font-size: 12px; color: #9ca3af;">You are receiving this because you are a valued customer. To stop receiving service reminders reply with STOP.</p>
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
