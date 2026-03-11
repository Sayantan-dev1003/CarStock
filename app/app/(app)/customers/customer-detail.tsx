import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    FlatList,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { customersApi } from '../../../src/api/customers.api';
import { vehiclesApi } from '../../../src/api/vehicles.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { AppButton } from '../../../src/components/common/AppButton';
import { VehicleCard } from '../../../src/components/customers/VehicleCard';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { formatCurrency, formatDate, formatBillNumber } from '../../../src/utils/format';

export default function CustomerDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
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
    });

    if (isLoading) return <LoadingSpinner />;
    if (!customer) return <Text>Customer not found</Text>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header / Profile */}
            <View style={styles.profileSection}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{customer.name.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.name}>{customer.name}</Text>
                <Text style={styles.mobile}>{customer.mobile}</Text>
                <View style={styles.badgeRow}>
                    <StatusBadge status={customer.tag} text={customer.tag} />
                    {customer.email && <Text style={styles.emailText}>{customer.email}</Text>}
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{customer.billCount}</Text>
                        <Text style={styles.statLabel}>Total Bills</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{formatCurrency(customer.totalSpend)}</Text>
                        <Text style={styles.statLabel}>Total Spend</Text>
                    </View>
                </View>

                <AppButton
                    title="Send Maintenance Reminder"
                    onPress={() => reminderMutation.mutate()}
                    variant="outline"
                    icon="bell-ring-outline"
                    loading={reminderMutation.isPending}
                    style={styles.reminderBtn}
                />
            </View>

            {/* Tabs */}
            <View style={styles.tabContainer}>
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
                        Previous Bills ({customer.bills?.length || 0})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View style={styles.contentSection}>
                {activeTab === 'vehicles' ? (
                    <View>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Registered Vehicles</Text>
                            <TouchableOpacity onPress={() => { }}>
                                <Text style={styles.addText}>+ Add Vehicle</Text>
                            </TouchableOpacity>
                        </View>
                        {customer.vehicles?.length > 0 ? (
                            customer.vehicles.map((v) => (
                                <VehicleCard key={v.id} vehicle={v} />
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No vehicles registered</Text>
                        )}
                    </View>
                ) : (
                    <View>
                        <Text style={styles.sectionTitle}>Bill History</Text>
                        {customer.bills?.length > 0 ? (
                            customer.bills.map((bill) => (
                                <TouchableOpacity
                                    key={bill.id}
                                    style={styles.billCard}
                                    onPress={() => { }} // Navigation to bill detail
                                >
                                    <View style={styles.billHeader}>
                                        <Text style={styles.billNumber}>{formatBillNumber(bill.billNumber)}</Text>
                                        <Text style={styles.billAmount}>{formatCurrency(bill.total)}</Text>
                                    </View>
                                    <View style={styles.billFooter}>
                                        <Text style={styles.billDate}>{formatDate(bill.createdAt)}</Text>
                                        <Text style={styles.billItems}>{bill.items?.length || 0} items</Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No previous bills found</Text>
                        )}
                    </View>
                )}
            </View>

            {/* Global Actions */}
            <View style={styles.actions}>
                <AppButton
                    title="New Bill"
                    onPress={() => {
                        // We could pre-fill the billing state with this customer
                        router.push('/(app)/billing');
                    }}
                    icon="plus"
                    fullWidth
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    profileSection: {
        backgroundColor: Colors.white,
        padding: Spacing.xl,
        alignItems: 'center',
        ...Shadows.sm,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.white,
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
    statsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.offWhite,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        width: '100%',
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
    reminderBtn: {
        marginTop: Spacing.xl,
        width: '100%',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.lg,
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
    contentSection: {
        padding: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.lg,
    },
    addText: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.primary,
        fontWeight: Typography.fontWeights.bold,
    },
    billCard: {
        backgroundColor: Colors.white,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    billHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    billNumber: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    billAmount: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.primary,
    },
    billFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    billDate: {
        fontSize: 10,
        color: Colors.grey400,
    },
    billItems: {
        fontSize: 10,
        color: Colors.grey400,
    },
    emptyText: {
        textAlign: 'center',
        padding: Spacing.xl,
        color: Colors.grey400,
        fontSize: Typography.fontSizes.sm,
    },
    actions: {
        padding: Spacing.lg,
    },
});
