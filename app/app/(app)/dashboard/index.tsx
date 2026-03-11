import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../../src/constants/theme';
import { reportsApi } from '../../../src/api/reports.api';
import { productsApi } from '../../../src/api/products.api';
import { MetricCard } from '../../../src/components/dashboard/MetricCard';
import { RevenueChart } from '../../../src/components/dashboard/RevenueChart';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { useNotifications } from '../../../src/hooks/useNotifications';
import { useAuthStore } from '../../../src/store/auth.store';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { AppButton } from '../../../src/components/common/AppButton';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const admin = useAuthStore((state) => state.admin);
    const notificationSetupDone = useRef(false);
    const { setup: setupNotifications } = useNotifications();

    useEffect(() => {
        if (!notificationSetupDone.current) {
            setupNotifications();
            notificationSetupDone.current = true;
        }
    }, []);

    const {
        data: dashboardData,
        isLoading: isDashboardLoading,
        refetch: refetchDashboard,
        isRefetching: isDashboardRefetching,
    } = useQuery({
        queryKey: ['dashboard'],
        queryFn: reportsApi.getDashboard,
        staleTime: 60000,
    });

    const {
        data: lowStockData,
        isLoading: isLowStockLoading,
    } = useQuery({
        queryKey: ['low-stock'],
        queryFn: productsApi.getLowStockProducts,
    });

    const onRefresh = () => {
        refetchDashboard();
        queryClient.invalidateQueries({ queryKey: ['low-stock'] });
    };

    if (isDashboardLoading || isLowStockLoading) {
        return <LoadingSpinner />;
    }

    const metrics = dashboardData?.metrics || {
        todayRevenue: 0,
        todayBills: 0,
        newCustomers: 0,
        lowStockCount: lowStockData?.length || 0,
    };

    const shopName = admin?.shopName || 'Shop';
    const currentTime = new Date().getHours();
    let greeting = 'Good Morning';
    if (currentTime >= 12 && currentTime < 17) greeting = 'Good Afternoon';
    else if (currentTime >= 17) greeting = 'Good Evening';

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl refreshing={isDashboardRefetching} onRefresh={onRefresh} tintColor={Colors.primary} />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{greeting}, {shopName}</Text>
                    <Text style={styles.date}>{formatDate(new Date())}</Text>
                </View>
                <TouchableOpacity style={styles.notificationBell}>
                    <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.dark} />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            {/* Metric Cards Grid */}
            <View style={styles.grid}>
                <View style={styles.gridRow}>
                    <MetricCard
                        title="Today's Revenue"
                        value={formatCurrency(metrics.todayRevenue)}
                        subtitle="Today's Sales"
                        icon="currency-inr"
                    />
                    <View style={{ width: Spacing.md }} />
                    <MetricCard
                        title="Bills Today"
                        value={metrics.todayBills}
                        subtitle="Transactions"
                        icon="receipt"
                    />
                </View>
                <View style={[styles.gridRow, { marginTop: Spacing.md }]}>
                    <MetricCard
                        title="New Customers"
                        value={metrics.newCustomers}
                        subtitle="Joined Today"
                        icon="account-plus"
                    />
                    <View style={{ width: Spacing.md }} />
                    <MetricCard
                        title="Low Stock"
                        value={metrics.lowStockCount}
                        subtitle="Items Need Reorder"
                        icon="alert-circle"
                        trend={metrics.lowStockCount > 0 ? { value: metrics.lowStockCount, label: 'items', isPositive: false } : undefined}
                    />
                </View>
            </View>

            {/* Revenue Chart */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Revenue This Week</Text>
                <RevenueChart data={dashboardData?.weeklyRevenue || []} />
            </View>

            {/* Low Stock Alerts */}
            {lowStockData && lowStockData.length > 0 && (
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.sectionTitle, { color: Colors.warning }]}>
                            ⚠️ Items Need Restocking
                        </Text>
                        <TouchableOpacity onPress={() => router.push('/(app)/inventory')}>
                            <Text style={styles.viewAll}>View All</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.listCard}>
                        {lowStockData.slice(0, 5).map((item: any, index: number) => (
                            <View key={item.id} style={[styles.listItem, index === 0 && { borderTopWidth: 0 }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName}>{item.name}</Text>
                                    <StatusBadge status={item.category} text={item.category} size="sm" />
                                </View>
                                <View style={styles.itemStock}>
                                    <Text style={styles.stockQty}>{item.quantity}</Text>
                                    <Text style={styles.stockLabel}>/ {item.reorderLevel}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {/* Top Products */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Products Today</Text>
                <View style={styles.listCard}>
                    {(dashboardData?.topProducts || []).map((item: any, index: number) => (
                        <View key={item.id} style={[styles.listItem, index === 0 && { borderTopWidth: 0 }]}>
                            <View style={styles.rankContainer}>
                                <Text style={styles.rankText}>{index + 1}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                                <Text style={styles.itemName}>{item.name}</Text>
                                <Text style={styles.itemInfo}>{item.quantitySold} units sold</Text>
                            </View>
                            <Text style={styles.itemRevenue}>{formatCurrency(item.revenue)}</Text>
                        </View>
                    ))}
                    {(!dashboardData?.topProducts || dashboardData.topProducts.length === 0) && (
                        <Text style={styles.emptyText}>No sales recorded today</Text>
                    )}
                </View>
            </View>

            {/* Generate Report Button */}
            <AppButton
                title="Generate Report"
                onPress={() => { }} // TODO: Open bottom sheet
                variant="outline"
                icon="file-document-outline"
                style={styles.reportBtn}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: Spacing.xxxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.sm,
    },
    greeting: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    date: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey500,
        marginTop: 2,
    },
    notificationBell: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    notificationDot: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        borderWidth: 1.5,
        borderColor: Colors.white,
    },
    grid: {
        marginBottom: Spacing.xl,
    },
    gridRow: {
        flexDirection: 'row',
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.sm,
    },
    viewAll: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.primary,
        fontWeight: Typography.fontWeights.medium,
    },
    listCard: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        ...Shadows.sm,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: Colors.grey100,
    },
    itemName: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: 2,
    },
    itemInfo: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
    },
    itemStock: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    stockQty: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.error,
    },
    stockLabel: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey400,
        marginLeft: 2,
    },
    rankContainer: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: Colors.grey100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: Typography.fontSizes.xs,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.grey600,
    },
    itemRevenue: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    emptyText: {
        padding: Spacing.md,
        textAlign: 'center',
        color: Colors.grey400,
        fontSize: Typography.fontSizes.sm,
    },
    reportBtn: {
        marginTop: Spacing.sm,
    },
});
