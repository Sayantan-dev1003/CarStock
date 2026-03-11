import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import puppeteer from 'puppeteer';
import {
    DailyReportData,
    WeeklyReportData,
    MonthlyReportData,
} from './interfaces/report-data';

@Injectable()
export class ReportPdfService {
    private readonly logger = new Logger(ReportPdfService.name);

    async generate(
        type: 'daily' | 'weekly' | 'monthly',
        data: DailyReportData | WeeklyReportData | MonthlyReportData
    ): Promise<Buffer> {
        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        try {
            const page = await browser.newPage();
            let html = '';

            if (type === 'daily') {
                html = this.buildDailyHtml(data as DailyReportData);
            } else if (type === 'weekly') {
                html = this.buildWeeklyHtml(data as WeeklyReportData);
            } else if (type === 'monthly') {
                html = this.buildMonthlyHtml(data as MonthlyReportData);
            }

            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

            return Buffer.from(pdfBuffer);
        } catch (error) {
            this.logger.error(`Failed to generate ${type} report PDF`, error);
            throw new InternalServerErrorException(`Failed to generate ${type} report PDF`);
        } finally {
            await browser.close();
        }
    }

    private getCommonStyles() {
        return `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #2D3748; padding: 40px; background: #fff; }
        .header { background: #1A202C; color: #fff; padding: 30px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
        .header h1 { font-size: 24px; margin-bottom: 4px; }
        .header p { opacity: 0.8; font-size: 14px; }
        
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #fff; border-top: 4px solid #E53E3E; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .metric-label { font-size: 12px; font-weight: 600; color: #718096; text-transform: uppercase; margin-bottom: 8px; }
        .metric-value { font-size: 24px; font-weight: 700; color: #1A202C; }
        
        section { margin-bottom: 30px; }
        h2 { font-size: 18px; margin-bottom: 16px; color: #2D3748; border-left: 4px solid #3182CE; padding-left: 12px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background: #fff; border-radius: 8px; overflow: hidden; }
        th { background: #EDF2F7; color: #4A5568; padding: 12px; text-align: left; font-size: 13px; font-weight: 600; }
        td { padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
        tr:last-child td { border-bottom: none; }
        
        .payment-breakdown { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .payment-box { background: #F7FAFC; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #E2E8F0; }
        .payment-box .label { font-size: 12px; color: #718096; margin-bottom: 4px; }
        .payment-box .amount { font-size: 18px; font-weight: 700; }

        .alert-section { background: #FFF5F5; border: 1px solid #FEB2B2; padding: 20px; border-radius: 8px; }
        .alert-header { color: #C53030; font-weight: 700; margin-bottom: 15px; font-size: 16px; display: flex; align-items: center; }

        .comparison-banner { padding: 15px 20px; border-radius: 8px; margin-bottom: 30px; display: flex; align-items: center; gap: 20px; }
        .comparison-positive { background: #F0FFF4; border: 1px solid #9AE6B4; color: #22543D; }
        .comparison-negative { background: #FFF5F5; border: 1px solid #FEB2B2; color: #822727; }
        .comparison-percentage { font-size: 20px; font-weight: 800; }

        .footer { margin-top: 50px; text-align: center; color: #A0AEC0; font-size: 12px; border-top: 1px solid #E2E8F0; padding-top: 20px; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
      </style>
    `;
    }

    private buildDailyHtml(data: DailyReportData): string {
        const topProductsRows = data.topProducts.map(p => `
      <tr>
        <td>${p.name}</td>
        <td>${p.category}</td>
        <td class="text-center">${p.quantitySold}</td>
        <td class="text-right">₹${p.revenue.toFixed(2)}</td>
      </tr>
    `).join('');

        const lowStockSection = data.lowStockItems.length > 0 ? `
      <section class="alert-section">
        <div class="alert-header">⚠️ Low Stock Alert</div>
        <table>
          <thead>
            <tr><th>Product Name</th><th>Category</th><th>Stock</th><th>Reorder Level</th></tr>
          </thead>
          <tbody>
            ${data.lowStockItems.map(i => `
              <tr><td>${i.name}</td><td>${i.category}</td><td>${i.currentQuantity}</td><td>${i.reorderLevel}</td></tr>
            `).join('')}
          </tbody>
        </table>
      </section>
    ` : '';

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        ${this.getCommonStyles()}
      </head>
      <body>
        <div class="header">
          <div>
            <h1>CarStock Admin</h1>
            <p>Daily Sales Report</p>
          </div>
          <div class="text-right">
            <p>${data.date}</p>
          </div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">₹${data.totalRevenue.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Bills</div>
            <div class="metric-value">${data.totalBills}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">New Customers</div>
            <div class="metric-value">${data.newCustomers}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Low Stock</div>
            <div class="metric-value">${data.lowStockItems.length}</div>
          </div>
        </div>

        <section>
          <h2>Top Products Today</h2>
          <table>
            <thead>
              <tr><th>Product Name</th><th>Category</th><th class="text-center">Qty Sold</th><th class="text-right">Revenue</th></tr>
            </thead>
            <tbody>${topProductsRows}</tbody>
          </table>
        </section>

        <section>
          <h2>Payment Breakdown</h2>
          <div class="payment-breakdown">
            <div class="payment-box"><div class="label">CASH</div><div class="amount">₹${data.paymentBreakdown.cash.toFixed(2)}</div></div>
            <div class="payment-box"><div class="label">UPI</div><div class="amount">₹${data.paymentBreakdown.upi.toFixed(2)}</div></div>
            <div class="payment-box"><div class="label">CARD</div><div class="amount">₹${data.paymentBreakdown.card.toFixed(2)}</div></div>
          </div>
        </section>

        ${lowStockSection}

        <div class="footer">
          Generated on ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} | Powered by CarStock
        </div>
      </body>
      </html>
    `;
    }

    private buildWeeklyHtml(data: WeeklyReportData): string {
        const isPositive = data.percentageChange >= 0;
        const comparisonClass = isPositive ? 'comparison-positive' : 'comparison-negative';
        const arrow = isPositive ? '↑' : '↓';

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        ${this.getCommonStyles()}
      </head>
      <body>
        <div class="header">
          <div>
            <h1>CarStock Admin</h1>
            <p>Weekly Performance Report</p>
          </div>
          <div class="text-right">
            <p>${data.weekStart} to ${data.weekEnd}</p>
          </div>
        </div>

        <div class="comparison-banner ${comparisonClass}">
          <div class="comparison-percentage">${arrow} ${Math.abs(data.percentageChange).toFixed(1)}%</div>
          <div>Compared to last week (₹${data.revenueVsLastWeek.toFixed(2)})</div>
        </div>

        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-label">Total Revenue</div>
            <div class="metric-value">₹${data.totalRevenue.toFixed(2)}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Total Bills</div>
            <div class="metric-value">${data.totalBills}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Repeat Customers</div>
            <div class="metric-value">${data.repeatCustomers}</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Top Category</div>
            <div class="metric-value" style="font-size: 16px;">${data.topCategory}</div>
          </div>
        </div>

        <section>
          <h2>Daily Breakdown</h2>
          <table>
            <thead><tr><th>Date</th><th>Bills</th><th class="text-right">Revenue</th></tr></thead>
            <tbody>
              ${data.dailyBreakdown.map(day => `
                <tr><td>${day.date}</td><td>${day.bills}</td><td class="text-right">₹${day.revenue.toFixed(2)}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Top Products this Week</h2>
          <table>
            <thead><tr><th>Product Name</th><th class="text-center">Qty</th><th class="text-right">Revenue</th></tr></thead>
            <tbody>
              ${data.topProducts.map(p => `
                <tr><td>${p.name}</td><td class="text-center">${p.quantitySold}</td><td class="text-right">₹${p.revenue.toFixed(2)}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <div class="footer">Generated on ${new Date().toLocaleString('en-IN')}</div>
      </body>
      </html>
    `;
    }

    private buildMonthlyHtml(data: MonthlyReportData): string {
        const isPositive = data.percentageChange >= 0;
        const comparisonClass = isPositive ? 'comparison-positive' : 'comparison-negative';
        const arrow = isPositive ? '↑' : '↓';

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
        ${this.getCommonStyles()}
      </head>
      <body>
        <div class="header">
          <div>
            <h1>CarStock Admin</h1>
            <p>Monthly Business Review — ${data.month} ${data.year}</p>
          </div>
        </div>

        <div class="comparison-banner ${comparisonClass}">
          <div class="comparison-percentage">${arrow} ${Math.abs(data.percentageChange).toFixed(1)}%</div>
          <div>Revenue growth vs last month (₹${data.revenueVsLastMonth.toFixed(2)})</div>
        </div>

        <section>
          <h2>Inventory Valuation</h2>
          <div class="payment-breakdown">
            <div class="payment-box"><div class="label">STOCK AT COST</div><div class="amount">₹${data.totalInventoryValueAtCost.toFixed(2)}</div></div>
            <div class="payment-box"><div class="label">STOCK AT RETAIL</div><div class="amount">₹${data.totalInventoryValueAtRetail.toFixed(2)}</div></div>
            <div class="payment-box"><div class="label">POTENTIAL MARGIN</div><div class="amount">₹${(data.totalInventoryValueAtRetail - data.totalInventoryValueAtCost).toFixed(2)}</div></div>
          </div>
        </section>

        <section>
          <h2>Top 10 Customers</h2>
          <table>
            <thead><tr><th>Name</th><th>Mobile</th><th class="text-center">Bills</th><th class="text-right">Spend</th></tr></thead>
            <tbody>
              ${data.topCustomers.map(c => `
                <tr><td>${c.name}</td><td>${c.mobile}</td><td class="text-center">${c.billCount}</td><td class="text-right">₹${c.totalSpend.toFixed(2)}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Category Breakdown</h2>
          <table>
            <thead><tr><th>Category</th><th class="text-right">Revenue</th><th class="text-right">Share (%)</th></tr></thead>
            <tbody>
              ${data.categoryBreakdown.map(cat => `
                <tr><td>${cat.category}</td><td class="text-right">₹${cat.revenue.toFixed(2)}</td><td class="text-right">${cat.percentage.toFixed(1)}%</td></tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Weekly Breakdown</h2>
          <table>
            <thead><tr><th>Week</th><th>Bills</th><th class="text-right">Revenue</th></tr></thead>
            <tbody>
              ${data.weeklyBreakdown.map(w => `
                <tr><td>${w.week}</td><td>${w.bills}</td><td class="text-right">₹${w.revenue.toFixed(2)}</td></tr>
              `).join('')}
            </tbody>
          </table>
        </section>

        <div class="footer">Generated on ${new Date().toLocaleString('en-IN')}</div>
      </body>
      </html>
    `;
    }
}
