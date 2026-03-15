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
import { useTheme } from '../../../../src/context/ThemeContext';
import { AppCard } from '../../../../src/components/common/AppCard';
import { reportsApi } from '../../../../src/api/reports.api';
import { productsApi } from '../../../../src/api/products.api';
import { AppHeader } from '../../../../src/components/common/AppHeader';
import { MetricCard } from '../../../../src/components/dashboard/MetricCard';
import { RevenueChart } from '../../../../src/components/dashboard/RevenueChart';
import { useSocket } from '../../../../src/hooks/useSocket';
import { useNotifications } from '../../../../src/hooks/useNotifications';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { formatCurrency, formatDate } from '../../../../src/utils/format';
import { AppButton } from '../../../../src/components/common/AppButton';

import { QuickActionGrid } from '../../../../src/components/dashboard/QuickActionGrid';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader 
        title="Admin Portal" 
        subtitle={formatDate(new Date())}
        rightAction={{
          icon: 'notifications-outline',
          onPress: () => router.push('/(app)/(tabs)/settings'),
        }}
      />
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isDashboardRefetching} 
            onRefresh={onRefresh} 
            colors={[theme.colors.primary]} 
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.subGreeting}>Here's what's happening with your stock today.</Text>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Today's Revenue"
              value={formatCurrency(dashboardData?.todayRevenue || 0)}
              icon="wallet"
              variant="primary"
              
            />
          </View>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Today's Bills"
              value={dashboardData?.todayBills || 0}
              icon="receipt-outline"
            />
            <MetricCard
              title="Total Stock"
              value={dashboardData?.totalStock || lowStockProducts?.length || 0}
              icon="cube-outline"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <QuickActionGrid />
        </View>

        {/* Revenue Chart */}
        <View style={styles.section}>
          <RevenueChart data={dashboardData?.weeklyRevenue || []} />
        </View>

        {/* Low Stock Alert */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
            <TouchableOpacity onPress={() => router.push('/(app)/(tabs)/inventory')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.stockList}>
            {lowStockProducts && lowStockProducts.length > 0 ? (
              lowStockProducts.slice(0, 3).map((product: any) => (
                <TouchableOpacity 
                  key={product.id} 
                  style={styles.stockItem}
                  onPress={() => router.push(`/(app)/inventory/${product.id}`)}
                >
                  <View style={[styles.stockIconCircle, { backgroundColor: '#FEE2E2' }]}>
                    <Ionicons name="alert-circle" size={20} color={theme.colors.error} />
                  </View>
                  <View style={styles.stockInfo}>
                    <Text style={styles.stockName}>{product.name}</Text>
                    <Text style={styles.stockCategory}>{product.category}</Text>
                  </View>
                  <View style={styles.stockBadge}>
                    <Text style={styles.stockBadgeText}>{product.quantity} left</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle-outline" size={40} color={theme.colors.success} />
                <Text style={styles.emptyText}>Stock levels are looking good!</Text>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  subGreeting: {
    fontSize: 15,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  metricsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.primary,
  },
  stockList: {
    gap: 12,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stockIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockName: {
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  stockCategory: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  stockBadge: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 12,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.error,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: theme.colors.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});


}
