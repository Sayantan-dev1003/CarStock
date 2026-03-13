import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import dayjs from 'dayjs';
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
    data: DailyReportData | WeeklyReportData | MonthlyReportData,
  ): Promise<Buffer> {
    let browser: puppeteer.Browser | undefined;
    try {
      browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
      });

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
      this.logger.error(`Failed to generate ${type} report PDF: ${error.message}`);
      throw new InternalServerErrorException(`Failed to generate ${type} report PDF`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private getCommonStyles() {
    return `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; color: #1F2937; line-height: 1.5; padding: 0; }
        .container { padding: 0; }
        
        .header { background: #1A1A2E; color: white; padding: 40px; text-align: left; }
        .header h1 { font-size: 28px; margin-bottom: 8px; font-weight: 700; }
        .header p { font-size: 16px; opacity: 0.9; }
        
        .content { padding: 40px; }
        
        .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 40px; }
        .metric-card { background: white; border-top: 4px solid #E23744; padding: 24px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .metric-label { font-size: 14px; color: #6B7280; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; }
        .metric-value { font-size: 32px; font-weight: 700; color: #E23744; }
        
        section { margin-bottom: 40px; }
        h2 { font-size: 20px; color: #111827; margin-bottom: 20px; font-weight: 700; border-left: 4px solid #1A1A2E; padding-left: 12px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #F9FAFB; color: #374151; padding: 12px 16px; text-align: left; font-size: 13px; font-weight: 600; border-bottom: 1px solid #E5E7EB; }
        td { padding: 12px 16px; border-bottom: 1px solid #F3F4F6; font-size: 14px; }
        tr:nth-child(even) { background-color: #FAFAFA; }
        
        .payment-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .payment-box { background: #F9FAFB; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #E5E7EB; }
        .payment-label { font-size: 12px; color: #6B7280; font-weight: 600; margin-bottom: 4px; }
        .payment-amount { font-size: 20px; font-weight: 700; color: #111827; }
        
        .alert-section { border: 1px solid #FED7AA; border-radius: 8px; overflow: hidden; }
        .alert-header { background: #F97316; color: white; padding: 12px 20px; font-weight: 700; font-size: 16px; }
        .alert-content { padding: 0; }
        .alert-content table tr:last-child td { border-bottom: none; }
        
        .comparison-banner { padding: 20px; border-radius: 8px; margin-bottom: 30px; display: flex; align-items: center; justify-content: space-between; }
        .comparison-positive { background: #F0FDF4; border: 1px solid #BBF7D0; color: #166534; }
        .comparison-negative { background: #FEF2F2; border: 1px solid #FECACA; color: #991B1B; }
        .comparison-text { font-size: 16px; font-weight: 500; }
        .comparison-change { font-size: 24px; font-weight: 700; }
        
        .progress-container { width: 100%; background-color: #E5E7EB; border-radius: 4px; height: 8px; margin-top: 4px; }
        .progress-bar { height: 100%; border-radius: 4px; background-color: #3B82F6; }
        
        .footer { padding: 40px; text-align: center; color: #9CA3AF; font-size: 12px; border-top: 1px solid #F3F4F6; }
        
        .highlight-row { background-color: #EFF6FF !important; font-weight: 600; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
      </style>
    `;
  }

  private buildDailyHtml(data: DailyReportData): string {
    const lowStockSection = data.lowStockItems.length > 0 ? `
      <section class="alert-section">
        <div class="alert-header">⚠️ Low Stock Alert</div>
        <div class="alert-content">
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th class="text-center">Current Qty</th>
                <th class="text-center">Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              ${data.lowStockItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td class="text-center">${item.currentQuantity}</td>
                  <td class="text-center">${item.reorderLevel}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </section>
    ` : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${this.getCommonStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CarStock Accessories</h1>
            <p>Daily Sales Report</p>
            <p>${dayjs(data.date).format('MMMM D, YYYY')}</p>
          </div>
          
          <div class="content">
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Total Revenue</div>
                <div class="metric-value">₹${data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
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
                <div class="metric-label">Low Stock Items</div>
                <div class="metric-value">${data.lowStockItems.length}</div>
              </div>
            </div>

            <section>
              <h2>Top Products Today</h2>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th class="text-center">Qty Sold</th>
                    <th class="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.topProducts.map((p, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${p.name}</td>
                      <td>${p.category}</td>
                      <td class="text-center">${p.quantitySold}</td>
                      <td class="text-right">₹${p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>

            <section>
              <h2>Payment Breakdown</h2>
              <div class="payment-grid">
                <div class="payment-box">
                  <div class="payment-label">CASH</div>
                  <div class="payment-amount">₹${data.paymentBreakdown.cash.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="payment-box">
                  <div class="payment-label">UPI</div>
                  <div class="payment-amount">₹${data.paymentBreakdown.upi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
                <div class="payment-box">
                  <div class="payment-label">CARD</div>
                  <div class="payment-amount">₹${data.paymentBreakdown.card.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
            </section>

            ${lowStockSection}
          </div>

          <div class="footer">
            Generated on ${dayjs().format('MMMM D, YYYY HH:mm A')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildWeeklyHtml(data: WeeklyReportData): string {
    const isPositive = data.percentageChange >= 0;
    const bannerClass = isPositive ? 'comparison-positive' : 'comparison-negative';
    const arrow = isPositive ? '↑' : '↓';

    const maxRevenue = data.dailyBreakdown.length > 0 ? Math.max(...data.dailyBreakdown.map(d => d.revenue)) : 0;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${this.getCommonStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CarStock Accessories</h1>
            <p>Weekly Performance Report</p>
            <p>${dayjs(data.weekStart).format('MMM D')} — ${dayjs(data.weekEnd).format('MMM D, YYYY')}</p>
          </div>

          <div class="content">
            <div class="comparison-banner ${bannerClass}">
              <div class="comparison-text">
                This week: <strong>₹${data.totalRevenue.toLocaleString('en-IN')}</strong> vs 
                Last week: <strong>₹${data.revenueVsLastWeek.toLocaleString('en-IN')}</strong>
              </div>
              <div class="comparison-change">
                ${arrow} ${Math.abs(data.percentageChange).toFixed(1)}%
              </div>
            </div>

            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-label">Total Bills</div>
                <div class="metric-value" style="color: #1A1A2E">${data.totalBills}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">New Customers</div>
                <div class="metric-value" style="color: #1A1A2E">${data.newCustomers}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Repeat Customers</div>
                <div class="metric-value" style="color: #1A1A2E">${data.repeatCustomers}</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Top Category</div>
                <div class="metric-value" style="color: #1A1A2E; font-size: 24px;">${data.topCategory}</div>
              </div>
            </div>

            <section>
              <h2>Daily Breakdown</h2>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th class="text-right">Bills</th>
                    <th class="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.dailyBreakdown.map(day => {
                    const isMax = day.revenue === maxRevenue && maxRevenue > 0;
                    return `
                      <tr class="${isMax ? 'highlight-row' : ''}">
                        <td>${dayjs(day.date).format('MMM DD')}</td>
                        <td>${dayjs(day.date).format('dddd')}</td>
                        <td class="text-right">${day.bills}</td>
                        <td class="text-right">₹${day.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </section>

            <section>
              <h2>Top Products this Week</h2>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th class="text-center">Qty Sold</th>
                    <th class="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.topProducts.map(p => `
                    <tr>
                      <td>${p.name}</td>
                      <td class="text-center">${p.quantitySold}</td>
                      <td class="text-right">₹${p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>

            ${data.lowStockItems.length > 0 ? `
              <section>
                <h2>Low Stock Items</h2>
                <table>
                  <thead>
                    <tr><th>Name</th><th class="text-center">Current Stock</th><th class="text-center">Reorder Level</th></tr>
                  </thead>
                  <tbody>
                    ${data.lowStockItems.map(i => `
                      <tr>
                        <td>${i.name}</td>
                        <td class="text-center">${i.currentQuantity}</td>
                        <td class="text-center">${i.reorderLevel}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </section>
            ` : ''}
          </div>

          <div class="footer">
            Generated on ${dayjs().format('MMMM D, YYYY HH:mm A')}
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildMonthlyHtml(data: MonthlyReportData): string {
    const isPositive = data.percentageChange >= 0;
    const bannerClass = isPositive ? 'comparison-positive' : 'comparison-negative';
    const arrow = isPositive ? '↑' : '↓';
    const margin = data.totalInventoryValueAtRetail - data.totalInventoryValueAtCost;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        ${this.getCommonStyles()}
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CarStock Accessories</h1>
            <p>Monthly Business Review</p>
            <p>${data.month} ${data.year}</p>
          </div>

          <div class="content">
            <div class="comparison-banner ${bannerClass}">
              <div class="comparison-text">
                Monthly Revenue: <strong>₹${data.totalRevenue.toLocaleString('en-IN')}</strong> vs 
                Last month: <strong>₹${data.revenueVsLastMonth.toLocaleString('en-IN')}</strong>
              </div>
              <div class="comparison-change">
                ${arrow} ${Math.abs(data.percentageChange).toFixed(1)}%
              </div>
            </div>

            <section>
              <h2>Inventory Value</h2>
              <div class="payment-grid">
                <div class="payment-box">
                  <div class="payment-label">STOCK AT COST</div>
                  <div class="payment-amount">₹${data.totalInventoryValueAtCost.toLocaleString('en-IN')}</div>
                </div>
                <div class="payment-box">
                  <div class="payment-label">STOCK AT RETAIL</div>
                  <div class="payment-amount">₹${data.totalInventoryValueAtRetail.toLocaleString('en-IN')}</div>
                </div>
                <div class="payment-box" style="background-color: #F0F9FF; border-color: #BAE6FD;">
                  <div class="payment-label" style="color: #0369A1;">POTENTIAL MARGIN</div>
                  <div class="payment-amount" style="color: #0369A1;">₹${margin.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </section>

            <section>
              <h2>Top 10 Products by Revenue</h2>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th class="text-center">Qty Sold</th>
                    <th class="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.topProducts.map((p, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${p.name}</td>
                      <td>${p.category}</td>
                      <td class="text-center">${p.quantitySold}</td>
                      <td class="text-right">₹${p.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>

            <section>
              <h2>Top 10 Customers</h2>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Mobile</th>
                    <th class="text-center">Bills</th>
                    <th class="text-right">Total Spend</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.topCustomers.map((c, i) => `
                    <tr>
                      <td>${i + 1}</td>
                      <td>${c.name}</td>
                      <td>${c.mobile}</td>
                      <td class="text-center">${c.billCount}</td>
                      <td class="text-right">₹${c.totalSpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>

            <section>
              <h2>Category Breakdown</h2>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th class="text-right">Revenue</th>
                    <th class="text-right">% of Total</th>
                    <th style="width: 150px">Share</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.categoryBreakdown.map(cat => `
                    <tr>
                      <td>${cat.category}</td>
                      <td class="text-right">₹${cat.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      <td class="text-right">${cat.percentage.toFixed(1)}%</td>
                      <td>
                        <div class="progress-container">
                          <div class="progress-bar" style="width: ${cat.percentage}%"></div>
                        </div>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>

            <section>
              <h2>Weekly Breakdown</h2>
              <table>
                <thead>
                  <tr><th>Week</th><th class="text-center">Total Bills</th><th class="text-right">Revenue</th></tr>
                </thead>
                <tbody>
                  ${data.weeklyBreakdown.map(w => `
                    <tr>
                      <td>${w.week}</td>
                      <td class="text-center">${w.bills}</td>
                      <td class="text-right">₹${w.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </section>
          </div>

          <div class="footer">
            Generated on ${dayjs().format('MMMM D, YYYY HH:mm A')}
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
