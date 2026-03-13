import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  DailyReportData,
  WeeklyReportData,
  MonthlyReportData,
} from './interfaces/report-data';
import dayjs from 'dayjs';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDailyData(date?: Date): Promise<DailyReportData> {
    const targetDate = dayjs(date || new Date());
    const startOfDay = targetDate.startOf('day').toDate();
    const endOfDay = targetDate.endOf('day').toDate();

    const [
      revenueAndBills,
      newCustomers,
      topProductsRaw,
      lowStockItemsRaw,
      paymentBreakdownRaw,
      billItemsForCategory,
    ] = await Promise.all([
      // Query 1 — Revenue and bill count
      this.prisma.bill.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      // Query 2 — New customers
      this.prisma.customer.count({
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      // Query 3 — Top products sold today
      this.prisma.billItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, total: true },
        where: {
          bill: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        },
        orderBy: {
          _sum: { total: 'desc' },
        },
        take: 5,
      }),
      // Query 4 — Low stock items
      this.prisma.product.findMany({
        where: {
          isActive: true,
          quantity: { lte: this.prisma.product.fields.reorderLevel },
        },
      }),
      // Query 5 — Payment breakdown
      this.prisma.bill.groupBy({
        by: ['paymentMode'],
        _sum: { total: true },
        where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      }),
      // Query 6 — Revenue by category
      this.prisma.billItem.findMany({
        where: {
          bill: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        },
        include: {
          product: {
            select: { category: true },
          },
        },
      }),
    ]);

    // Resolve top products names and categories
    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: true },
        });
        return {
          name: product?.name || 'Unknown',
          category: product?.category || 'General',
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      }),
    );

    // Process payment breakdown
    const paymentBreakdown = { cash: 0, upi: 0, card: 0 };
    paymentBreakdownRaw.forEach((item) => {
      const mode = item.paymentMode.toLowerCase();
      if (mode === 'cash') paymentBreakdown.cash = item._sum.total || 0;
      else if (mode === 'upi') paymentBreakdown.upi = item._sum.total || 0;
      else if (mode === 'card') paymentBreakdown.card = item._sum.total || 0;
    });

    // Process revenue by category
    const categoryMap = new Map<string, number>();
    billItemsForCategory.forEach((item) => {
      const cat = item.product.category;
      const current = categoryMap.get(cat) || 0;
      categoryMap.set(cat, current + item.total);
    });
    const revenueByCategory = Array.from(categoryMap.entries()).map(
      ([category, revenue]) => ({
        category,
        revenue,
      }),
    );

    this.logger.log(`Daily report data gathered for ${targetDate.toDate().toDateString()}`);

    return {
      date: targetDate.format('YYYY-MM-DD'),
      totalRevenue: revenueAndBills._sum.total || 0,
      totalBills: revenueAndBills._count.id || 0,
      newCustomers,
      topProducts,
      lowStockItems: lowStockItemsRaw.map((i) => ({
        name: i.name,
        category: i.category,
        currentQuantity: i.quantity,
        reorderLevel: i.reorderLevel,
      })),
      paymentBreakdown,
      revenueByCategory,
    };
  }

  async getWeeklyData(weekStart?: Date): Promise<WeeklyReportData> {
    const start = weekStart
      ? dayjs(weekStart).startOf('day')
      : dayjs().startOf('week').add(1, 'day'); // Monday
    const end = start.add(7, 'day').subtract(1, 'second');

    const prevStart = start.subtract(7, 'day');
    const prevEnd = start.subtract(1, 'second');

    const [
      thisWeekAgg,
      lastWeekAgg,
      newCustomers,
      repeatCustomersCount,
      dailyBreakdownRaw,
      topProductsRaw,
      lowStockItemsRaw,
    ] = await Promise.all([
      // Query 1 — This week revenue and bills
      this.prisma.bill.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: { createdAt: { gte: start.toDate(), lte: end.toDate() } },
      }),
      // Query 2 — Last week revenue
      this.prisma.bill.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: prevStart.toDate(), lte: prevEnd.toDate() } },
      }),
      // Query 3 — New customers
      this.prisma.customer.count({
        where: { createdAt: { gte: start.toDate(), lte: end.toDate() } },
      }),
      // Query 4 — Repeat customers (bills this week AND bills before this week)
      this.prisma.customer.count({
        where: {
          bills: {
            some: { createdAt: { gte: start.toDate(), lte: end.toDate() } },
          },
          AND: {
            bills: {
              some: { createdAt: { lt: start.toDate() } },
            },
          },
        },
      }),
      // Query 5 — Daily breakdown
      this.getDailyBreakdown(start.toDate(), end.toDate()),
      // Query 6 — Top products
      this.prisma.billItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, total: true },
        where: {
          bill: {
            createdAt: { gte: start.toDate(), lte: end.toDate() },
          },
        },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
      // Query 7 — Low stock
      this.prisma.product.findMany({
        where: {
          isActive: true,
          quantity: { lte: this.prisma.product.fields.reorderLevel },
        },
      }),
    ]);

    const thisWeekRev = thisWeekAgg._sum.total || 0;
    const lastWeekRev = lastWeekAgg._sum.total || 0;
    const percentageChange =
      lastWeekRev === 0 ? 100 : ((thisWeekRev - lastWeekRev) / lastWeekRev) * 100;

    // Resolve top products
    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: true },
        });
        return {
          name: product?.name || 'Unknown',
          category: product?.category || 'General',
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      }),
    );

    // Calculate top category
    const categoryMap = new Map<string, number>();
    topProducts.forEach((p) => {
      const current = categoryMap.get(p.category) || 0;
      categoryMap.set(p.category, current + p.revenue);
    });

    let topCategory = 'N/A';
    let maxRevenue = 0;
    categoryMap.forEach((rev, cat) => {
      if (rev > maxRevenue) {
        maxRevenue = rev;
        topCategory = cat;
      }
    });

    return {
      weekStart: start.format('YYYY-MM-DD'),
      weekEnd: end.format('YYYY-MM-DD'),
      totalRevenue: thisWeekRev,
      totalBills: thisWeekAgg._count.id || 0,
      newCustomers,
      repeatCustomers: repeatCustomersCount,
      revenueVsLastWeek: lastWeekRev,
      percentageChange,
      topCategory,
      topProducts: topProducts.map((p) => ({
        name: p.name,
        quantitySold: p.quantitySold,
        revenue: p.revenue,
      })),
      lowStockItems: lowStockItemsRaw.map((i) => ({
        name: i.name,
        currentQuantity: i.quantity,
        reorderLevel: i.reorderLevel,
      })),
      dailyBreakdown: dailyBreakdownRaw,
    };
  }

  async getMonthlyData(month?: number, year?: number): Promise<MonthlyReportData> {
    const now = dayjs();
    const targetMonth = month !== undefined ? month - 1 : now.month();
    const targetYear = year || now.year();

    const start = dayjs().year(targetYear).month(targetMonth).startOf('month');
    const end = start.endOf('month');

    const prevStart = start.subtract(1, 'month').startOf('month');
    const prevEnd = prevStart.endOf('month');

    const [
      thisMonthAgg,
      lastMonthAgg,
      newCustomers,
      productsForInventory,
      topProductsRaw,
      topCustomersRaw,
      billItemsForCategory,
    ] = await Promise.all([
      // Query 1 — This month revenue and bills
      this.prisma.bill.aggregate({
        _sum: { total: true },
        _count: { id: true },
        where: { createdAt: { gte: start.toDate(), lte: end.toDate() } },
      }),
      // Query 2 — Last month revenue
      this.prisma.bill.aggregate({
        _sum: { total: true },
        where: { createdAt: { gte: prevStart.toDate(), lte: prevEnd.toDate() } },
      }),
      // Query 3 — New customers
      this.prisma.customer.count({
        where: { createdAt: { gte: start.toDate(), lte: end.toDate() } },
      }),
      // Query 4 — Inventory value
      this.prisma.product.findMany({
        where: { isActive: true },
        select: { quantity: true, costPrice: true, sellingPrice: true },
      }),
      // Query 5 — Top 10 products
      this.prisma.billItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, total: true },
        where: {
          bill: {
            createdAt: { gte: start.toDate(), lte: end.toDate() },
          },
        },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
      // Query 6 — Top 10 customers
      this.prisma.bill.groupBy({
        by: ['customerId'],
        _sum: { total: true },
        _count: { id: true },
        where: { createdAt: { gte: start.toDate(), lte: end.toDate() } },
        orderBy: { _sum: { total: 'desc' } },
        take: 10,
      }),
      // Query 8 — Category breakdown pre-fetch
      this.prisma.billItem.findMany({
        where: {
          bill: {
            createdAt: { gte: start.toDate(), lte: end.toDate() },
          },
        },
        include: {
          product: {
            select: { category: true },
          },
        },
      }),
    ]);

    // Query 7 — Weekly breakdown for the month
    const weeklyBreakdown = await this.getWeeklyBreakdownForMonth(start);

    // Calculate inventory values
    let totalInventoryValueAtCost = 0;
    let totalInventoryValueAtRetail = 0;
    productsForInventory.forEach((p) => {
      totalInventoryValueAtCost += p.quantity * p.costPrice;
      totalInventoryValueAtRetail += p.quantity * p.sellingPrice;
    });

    const thisMonthRev = thisMonthAgg._sum.total || 0;
    const lastMonthRev = lastMonthAgg._sum.total || 0;
    const percentageChange =
      lastMonthRev === 0 ? 100 : ((thisMonthRev - lastMonthRev) / lastMonthRev) * 100;

    // Resolve top products
    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await this.prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true, category: true },
        });
        return {
          name: product?.name || 'Unknown',
          category: product?.category || 'General',
          quantitySold: item._sum.quantity || 0,
          revenue: item._sum.total || 0,
        };
      }),
    );

    // Resolve top customers
    const topCustomers = await Promise.all(
      topCustomersRaw.map(async (item) => {
        const customer = await this.prisma.customer.findUnique({
          where: { id: item.customerId },
          select: { name: true, mobile: true },
        });
        return {
          name: customer?.name || 'Unknown',
          mobile: customer?.mobile || 'N/A',
          totalSpend: item._sum.total || 0,
          billCount: item._count.id || 0,
        };
      }),
    );

    // Process category breakdown
    const categoryMap = new Map<string, number>();
    billItemsForCategory.forEach((item) => {
      const cat = item.product.category;
      const current = categoryMap.get(cat) || 0;
      categoryMap.set(cat, current + item.total);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(
      ([category, revenue]) => ({
        category,
        revenue,
        percentage: thisMonthRev > 0 ? (revenue / thisMonthRev) * 100 : 0,
      }),
    );

    return {
      month: start.format('MMMM'),
      year: targetYear,
      totalRevenue: thisMonthRev,
      totalBills: thisMonthAgg._count.id || 0,
      newCustomers,
      totalInventoryValueAtCost,
      totalInventoryValueAtRetail,
      revenueVsLastMonth: lastMonthRev,
      percentageChange,
      topProducts,
      topCustomers,
      weeklyBreakdown,
      categoryBreakdown,
    };
  }

  private async getDailyBreakdown(start: Date, end: Date) {
    const days: dayjs.Dayjs[] = [];
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isBefore(last) || current.isSame(last, 'day')) {
      days.push(current);
      current = current.add(1, 'day');
    }

    return Promise.all(
      days.map(async (day) => {
        const s = day.startOf('day').toDate();
        const e = day.endOf('day').toDate();
        const agg = await this.prisma.bill.aggregate({
          _sum: { total: true },
          _count: { id: true },
          where: { createdAt: { gte: s, lte: e } },
        });
        return {
          date: day.format('YYYY-MM-DD'),
          revenue: agg._sum.total || 0,
          bills: agg._count.id || 0,
        };
      }),
    );
  }

  private async getWeeklyBreakdownForMonth(monthStart: dayjs.Dayjs) {
    const weeks: Array<{ label: string; start: Date; end: Date }> = [];
    let current = monthStart;
    const endOfMonth = monthStart.endOf('month');

    let weekNum = 1;
    while (current.isBefore(endOfMonth)) {
      let next = current.add(7, 'day');
      if (next.isAfter(endOfMonth)) next = endOfMonth.add(1, 'millisecond');

      weeks.push({
        label: `Week ${weekNum}`,
        start: current.toDate(),
        end: next.subtract(1, 'millisecond').toDate(),
      });
      current = next;
      weekNum++;
    }

    return Promise.all(
      weeks.map(async (w) => {
        const agg = await this.prisma.bill.aggregate({
          _sum: { total: true },
          _count: { id: true },
          where: { createdAt: { gte: w.start, lte: w.end } },
        });
        return {
          week: w.label,
          revenue: agg._sum.total || 0,
          bills: agg._count.id || 0,
        };
      }),
    );
  }
}
