export interface DailyReportData {
    date: string;
    totalRevenue: number;
    totalBills: number;
    newCustomers: number;
    topProducts: Array<{
        name: string;
        category: string;
        quantitySold: number;
        revenue: number;
    }>;
    lowStockItems: Array<{
        name: string;
        category: string;
        currentQuantity: number;
        reorderLevel: number;
    }>;
    paymentBreakdown: {
        cash: number;
        upi: number;
        card: number;
    };
    revenueByCategory: Array<{
        category: string;
        revenue: number;
    }>;
}

export interface WeeklyReportData {
    weekStart: string;
    weekEnd: string;
    totalRevenue: number;
    totalBills: number;
    newCustomers: number;
    repeatCustomers: number;
    revenueVsLastWeek: number;
    percentageChange: number;
    topCategory: string;
    topProducts: Array<{
        name: string;
        quantitySold: number;
        revenue: number;
    }>;
    lowStockItems: Array<{
        name: string;
        currentQuantity: number;
        reorderLevel: number;
    }>;
    dailyBreakdown: Array<{
        date: string;
        revenue: number;
        bills: number;
    }>;
}

export interface MonthlyReportData {
    month: string;
    year: number;
    totalRevenue: number;
    totalBills: number;
    newCustomers: number;
    totalInventoryValueAtCost: number;
    totalInventoryValueAtRetail: number;
    revenueVsLastMonth: number;
    percentageChange: number;
    topProducts: Array<{
        name: string;
        category: string;
        quantitySold: number;
        revenue: number;
    }>;
    topCustomers: Array<{
        name: string;
        mobile: string;
        totalSpend: number;
        billCount: number;
    }>;
    weeklyBreakdown: Array<{
        week: string;
        revenue: number;
        bills: number;
    }>;
    categoryBreakdown: Array<{
        category: string;
        revenue: number;
        percentage: number;
    }>;
}
