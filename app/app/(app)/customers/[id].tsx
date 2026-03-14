import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../src/constants/theme';
import { customersApi } from '../../../src/api/customers.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { AppButton } from '../../../src/components/common/AppButton';
import { VehicleCard } from '../../../src/components/customers/VehicleCard';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { formatCurrency, formatDate, formatBillNumber } from '../../../src/utils/format';
import { AppHeader } from '../../../src/components/common/AppHeader';

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
    <View style={styles.container}>
      <AppHeader title="Customer Profile" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Profile Card */}
        <View style={styles.profileHeader}>
          <View style={styles.profileMain}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{customer.name.substring(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{customer.name}</Text>
              <Text style={styles.mobile}>{customer.mobile}</Text>
              <View style={styles.badgeRow}>
                <StatusBadge status={customer.tag} />
                {customer.email && <Text numberOfLines={1} style={styles.emailText}>{customer.email}</Text>}
              </View>
            </View>
          </View>

          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{(customer.bills || []).length}</Text>
              <Text style={styles.statLabel}>Total Bills</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatCurrency(customer.totalSpend)}</Text>
              <Text style={styles.statLabel}>Total Revenue</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsBar}>
          <AppButton
            title="Send Reminder"
            onPress={() => reminderMutation.mutate()}
            variant="outline"
            leftIcon="notifications-outline"
            loading={reminderMutation.isPending}
            style={styles.actionBtn}
          />
          <AppButton
            title="Create Bill"
            onPress={() => router.push({ pathname: '/(app)/(tabs)/billing', params: { customerId: customer.id } })}
            leftIcon="add"
            style={[styles.actionBtn, { marginLeft: 12 }]}
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
              Billing History ({customer.bills?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.tabContent}>
          {activeTab === 'vehicles' ? (
            <View>
              {customer.vehicles && customer.vehicles.length > 0 ? (
                <View style={styles.vehicleList}>
                  {customer.vehicles.map((vehicle: any) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} />
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="car-off" size={48} color={theme.colors.bgMuted} />
                  <Text style={styles.emptyText}>No vehicles registered</Text>
                </View>
              )}
            </View>
          ) : (
            <View>
              {customer.bills && customer.bills.length > 0 ? (
                customer.bills.map((bill: any) => (
                  <TouchableOpacity 
                    key={bill.id} 
                    style={styles.billCard}
                    activeOpacity={0.7}
                    onPress={() => router.push({ pathname: '/(app)/billing/bill-success', params: { id: bill.id } })}
                  >
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
                          color={bill.emailSent ? theme.colors.success : theme.colors.textMuted} 
                        />
                        <MaterialCommunityIcons 
                          name="whatsapp" 
                          size={14} 
                          color={bill.whatsappSent ? theme.colors.success : theme.colors.textMuted} 
                          style={{ marginLeft: 12 }}
                        />
                      </View>
                      <Text style={styles.viewLink}>View Invoice</Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MaterialCommunityIcons name="receipt-outline" size={48} color={theme.colors.bgMuted} />
                  <Text style={styles.emptyText}>No bill history found</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  profileHeader: {
    backgroundColor: theme.colors.bgCard,
    padding: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadow.card,
  },
  profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 20,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  mobile: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginVertical: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emailText: {
    fontSize: 13,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginLeft: 12,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgMuted,
    borderRadius: theme.radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 12,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.bgMuted,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.primary,
    fontFamily: theme.font.bodyBold,
  },
  tabContent: {
    padding: 24,
  },
  vehicleList: {
    width: '100%',
  },
  billCard: {
    backgroundColor: theme.colors.bgCard,
    padding: 16,
    borderRadius: theme.radius.md,
    marginBottom: 16,
    ...theme.shadow.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  billMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  billNumber: {
    fontSize: 14,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  billDate: {
    fontSize: 11,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  billAmount: {
    fontSize: 16,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.primary,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: theme.colors.bgMuted,
    paddingTop: 12,
  },
  deliveryStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewLink: {
    fontSize: 12,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 16,
  },
});
