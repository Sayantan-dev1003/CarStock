import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { reportsApi } from '../../../src/api/reports.api';
import { productsApi } from '../../../src/api/products.api';
import { MetricCard } from '../../../src/components/dashboard/MetricCard';
import { RevenueChart } from '../../../src/components/dashboard/RevenueChart';
import { useSocket } from '../../../src/hooks/useSocket';
import { useNotifications } from '../../../src/hooks/useNotifications';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { AppButton } from '../../../src/components/common/AppButton';

export default function DashboardScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
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
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (isDashboardLoading || isLowStockLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isDashboardRefetching} onRefresh={onRefresh} colors={[Colors.primary]} />
        }
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, Admin</Text>
            <Text style={styles.date}>{formatDate(new Date())}</Text>
          </View>
          <TouchableOpacity style={styles.notificationBell}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={Colors.dark} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.row}>
            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(dashboardData?.todayRevenue || 0)}
              subtitle="Daily Sales"
              icon="currency-inr"
              trend={{ value: 12, isPositive: true }}
            />
            <MetricCard
              title="Bills Today"
              value={dashboardData?.todayBills || 0}
              subtitle="Transactions"
              icon="receipt"
            />
          </View>
          <View style={styles.row}>
            <MetricCard
              title="New Customers"
              value={dashboardData?.newCustomersToday || 0}
              subtitle="Joined Today"
              icon="account-plus"
            />
            <MetricCard
              title="Low Stock"
              value={lowStockProducts?.length || 0}
              subtitle="Needs Reorder"
              icon="alert-circle"
              trend={lowStockProducts && lowStockProducts.length > 0 ? { value: lowStockProducts.length, isPositive: false } : undefined}
            />
          </View>
        </View>

        {/* Revenue Chart */}
        <RevenueChart data={dashboardData?.weeklyRevenue || []} />

        {/* Low Stock Alerts */}
        {lowStockProducts && lowStockProducts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⚠️ Low Stock Alerts</Text>
              <TouchableOpacity onPress={() => router.push('/(app)/inventory')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.lowStockCard}>
              {lowStockProducts.slice(0, 5).map((product: any) => (
                <View key={product.id} style={styles.lowStockItem}>
                  <View style={styles.lowStockInfo}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.category}>{product.category}</Text>
                  </View>
                  <View style={styles.stockLevel}>
                    <Text style={styles.stockQty}>{product.quantity}</Text>
                    <Text style={styles.stockLimit}>/ {product.reorderLevel}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <AppButton
            title="Generate Weekly Report"
            variant="outline"
            leftIcon="file-document-outline"
            onPress={() => reportsApi.generateReport('WEEKLY')}
            fullWidth
          />
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  container: {
    flex: 1,
    padding: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
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
    justifyContent: 'center',
    alignItems: 'center',
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
  metricsGrid: {
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  section: {
    marginTop: Spacing.lg,
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
  },
  viewAll: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.semibold,
  },
  lowStockCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.warningLight,
    ...Shadows.sm,
  },
  lowStockItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  lowStockInfo: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.dark,
  },
  category: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  stockLevel: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  stockQty: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.error,
  },
  stockLimit: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey400,
    marginLeft: 2,
  },
  bottomActions: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
});
