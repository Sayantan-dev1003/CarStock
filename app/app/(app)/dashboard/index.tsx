import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../../src/constants/theme';
import { AppCard } from '../../../src/components/common/AppCard';
import { reportsApi } from '../../../src/api/reports.api';
import { productsApi } from '../../../src/api/products.api';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { MetricCard } from '../../../src/components/dashboard/MetricCard';
import { RevenueChart } from '../../../src/components/dashboard/RevenueChart';
import { useSocket } from '../../../src/hooks/useSocket';
import { useNotifications } from '../../../src/hooks/useNotifications';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { AppButton } from '../../../src/components/common/AppButton';

export default function DashboardScreen() {
  const router = useRouter();
  const { isConnected } = useSocket();
  const { setup: setupNotifications } = useNotifications();
  const notificationSetupRef = useRef(false);

  useEffect(() => {
    if (!notificationSetupRef.current) {
      setupNotifications();
      notificationSetupRef.current = true;
    }
  }, []);

  const { 
    data: dashboardData, 
    isLoading: isDashboardLoading, 
    isRefetching: isDashboardRefetching,
    refetch: refetchDashboard
  } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsApi.getDashboard(),
    staleTime: 60000,
  });

  const { 
    data: lowStockProducts, 
    isLoading: isLowStockLoading,
    refetch: refetchLowStock
  } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => productsApi.getLowStockProducts(),
  });

  const onRefresh = () => {
    refetchDashboard();
    refetchLowStock();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isDashboardLoading || isLowStockLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader 
        title={getGreeting() + " 👋"}
        subtitle="Here's your shop overview"
        rightAction={{
          icon: 'notifications-outline',
          onPress: () => router.push('/(app)/settings'), // Example action
        }}
      />
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={isDashboardRefetching} onRefresh={onRefresh} colors={[theme.colors.primary]} />
        }
      >
        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(dashboardData?.todayRevenue || 0)}
              icon="wallet-outline"
              trend={{ value: 12, isPositive: true }}
            />
            <MetricCard
              title="Today's Bills"
              value={dashboardData?.todayBills || 0}
              icon="receipt-outline"
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Total Stock"
              value={dashboardData?.totalStock || lowStockProducts?.length || 0}
              icon="cube-outline"
              trend={lowStockProducts && lowStockProducts.length > 0 ? { value: lowStockProducts.length, isPositive: false } : undefined}
            />
            <MetricCard
              title="Total Customers"
              value={dashboardData?.totalCustomers || 0}
              icon="people-outline"
            />
          </View>
        </View>

        {/* Revenue Chart */}
        <View style={styles.chartSection}>
          <RevenueChart data={dashboardData?.weeklyRevenue || []} />
        </View>

        {/* Recent Activity / Low Stock Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>LOW STOCK ALERT</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/inventory')}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {lowStockProducts && lowStockProducts.length > 0 ? (
            lowStockProducts.slice(0, 3).map((product: any) => (
              <AppCard 
                key={product.id} 
                style={styles.activityCard}
                onPress={() => router.push(`/(app)/inventory/${product.id}`)}
              >
                <View style={styles.iconCircle}>
                  <Ionicons name="alert-circle-outline" size={20} color={theme.colors.primary} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{product.name}</Text>
                  <Text style={styles.activitySubtitle}>{product.category} • {product.quantity} in stock</Text>
                </View>
                <Text style={styles.timestamp}>Needs Reorder</Text>
              </AppCard>
            ))
          ) : (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyText}>No low stock items</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomActions}>
          <AppButton
            title="Generate Weekly Report"
            variant="outline"
            leftIcon="document-text-outline"
            onPress={() => reportsApi.generateReport('WEEKLY')}
            fullWidth
          />
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  metricsGrid: {
    gap: 16,
    marginBottom: theme.spacing.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  chartSection: {
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  viewAll: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.primary,
  },
  activityCard: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  activitySubtitle: {
    fontSize: 13,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.primary,
  },
  emptyActivity: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
  bottomActions: {
    marginTop: theme.spacing.xl,
  },
});
