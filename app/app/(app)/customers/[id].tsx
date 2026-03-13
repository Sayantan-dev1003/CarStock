import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { customersApi } from '../../../src/api/customers.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { AppButton } from '../../../src/components/common/AppButton';
import { VehicleCard } from '../../../src/components/customers/VehicleCard';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { formatCurrency, formatDate, formatBillNumber } from '../../../src/utils/format';

export default function CustomerDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'vehicles' | 'bills'>('vehicles');

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getCustomer(id as string),
  });

  const reminderMutation = useMutation({
    mutationFn: () => customersApi.sendReminder(id as string),
    onSuccess: (data) => {
      Alert.alert(
        'Reminder Sent',
        `Reminder sent successfully via ${data.whatsappSent ? 'WhatsApp' : ''}${data.whatsappSent && data.emailSent ? ' and ' : ''}${data.emailSent ? 'Email' : ''}.`
      );
    },
    onError: (err) => {
      Alert.alert('Error', 'Failed to send reminder. Please try again.');
    }
  });

  if (isLoading) return <LoadingSpinner />;
  if (!customer) return <View style={styles.container}><Text>Customer not found</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Profile Card */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.name.substring(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{customer.name}</Text>
          <Text style={styles.mobile}>{customer.mobile}</Text>
          <View style={styles.badgeRow}>
            <StatusBadge status={customer.tag} />
            {customer.email && <Text style={styles.emailText}>{customer.email}</Text>}
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(customer.bills || []).length}</Text>
              <Text style={styles.statLabel}>Total Bills</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(customer.totalSpend)}</Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsBar}>
          <AppButton
            title="Service Reminder"
            onPress={() => reminderMutation.mutate()}
            variant="outline"
            leftIcon="bell-ring-outline"
            loading={reminderMutation.isPending}
            style={styles.actionBtn}
          />
          <AppButton
            title="New Bill"
            onPress={() => router.push({ pathname: '/(app)/billing', params: { customerId: customer.id } })}
            leftIcon="plus"
            style={[styles.actionBtn, { marginLeft: Spacing.sm }]}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'vehicles' && styles.activeTab]}
            onPress={() => setActiveTab('vehicles')}
          >
            <Text style={[styles.tabText, activeTab === 'vehicles' && styles.activeTabText]}>
              Vehicles ({customer.vehicles?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'bills' && styles.activeTab]}
            onPress={() => setActiveTab('bills')}
          >
            <Text style={[styles.tabText, activeTab === 'bills' && styles.activeTabText]}>
              Bills ({customer.bills?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.tabContent}>
          {activeTab === 'vehicles' ? (
            <View>
              {customer.vehicles && customer.vehicles.length > 0 ? (
                customer.vehicles.map((vehicle: any) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="car-off" size={48} color={Colors.grey200} />
                  <Text style={styles.emptyText}>No vehicles registered</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              {customer.bills && customer.bills.length > 0 ? (
                customer.bills.map((bill: any) => (
                  <TouchableOpacity key={bill.id} style={styles.billCard}>
                    <View style={styles.billMain}>
                      <View>
                        <Text style={styles.billNumber}>{formatBillNumber(bill.billNumber)}</Text>
                        <Text style={styles.billDate}>{formatDate(bill.createdAt)}</Text>
                      </View>
                      <Text style={styles.billAmount}>{formatCurrency(bill.total)}</Text>
                    </View>
                    <View style={styles.billFooter}>
                      <View style={styles.deliveryStatus}>
                        <MaterialCommunityIcons 
                          name="email-check" 
                          size={14} 
                          color={bill.emailSent ? Colors.success : Colors.grey300} 
                        />
                        <MaterialCommunityIcons 
                          name="whatsapp" 
                          size={14} 
                          color={bill.whatsappSent ? Colors.success : Colors.grey300} 
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                      <Text style={styles.viewLink}>View Details</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="receipt-outline" size={48} color={Colors.grey200} />
                  <Text style={styles.emptyText}>No bill history found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Shadows.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  name: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginBottom: 4,
  },
  mobile: {
    fontSize: Typography.fontSizes.base,
    color: Colors.grey500,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emailText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey400,
    marginLeft: Spacing.md,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    marginTop: Spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.grey500,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.grey200,
  },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  actionBtn: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  tab: {
    paddingVertical: Spacing.md,
    marginRight: Spacing.xl,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.medium,
    color: Colors.grey500,
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
  },
  tabContent: {
    padding: Spacing.lg,
  },
  billCard: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  billMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  billNumber: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  billDate: {
    fontSize: 10,
    color: Colors.grey400,
    marginTop: 2,
  },
  billAmount: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.grey100,
    paddingTop: Spacing.sm,
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewLink: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.bold,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey400,
    marginTop: Spacing.md,
  },
});
