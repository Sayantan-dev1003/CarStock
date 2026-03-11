import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { AppButton } from '../../../src/components/common/AppButton';
import { billingApi } from '../../../src/api/billing.api';
import { useBillingStore } from '../../../src/store/billing.store';
import { formatCurrency } from '../../../src/utils/format';
import { PaymentMode, CreateBillPayload } from '../../../src/types/billing.types';

export default function PaymentScreen() {
    const router = useRouter();
    const {
        items,
        customerId,
        customerName,
        vehicleId,
        discount,
        paymentMode,
        setPaymentMode,
        getTotal,
        clearBill,
    } = useBillingStore();

    const [loading, setLoading] = useState(false);
    const total = getTotal();

    const handleConfirm = async () => {
        if (!paymentMode || !customerId) return;

        setLoading(true);
        try {
            const payload: CreateBillPayload = {
                customerId,
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
                paymentMode,
                discount,
                vehicleId: vehicleId || undefined,
            };

            const bill = await billingApi.createBill(payload);
            router.replace({
                pathname: '/(app)/billing/bill-success',
                params: { bill: JSON.stringify(bill) },
            });
        } catch (error: any) {
            console.error('Create bill error:', error);
            const message = error.response?.data?.message || 'Failed to create bill';
            Alert.alert('Error', message);

            if (message.toLowerCase().includes('stock')) {
                router.back();
            }
        } finally {
            setLoading(false);
        }
    };

    const renderPaymentCard = (mode: PaymentMode, icon: string, label: string) => {
        const isSelected = paymentMode === mode;
        return (
            <TouchableOpacity
                style={[
                    styles.paymentCard,
                    isSelected && styles.selectedCard,
                ]}
                onPress={() => setPaymentMode(mode)}
            >
                <MaterialCommunityIcons
                    name={icon as any}
                    size={32}
                    color={isSelected ? Colors.primary : Colors.grey400}
                />
                <Text style={[
                    styles.paymentLabel,
                    isSelected && styles.selectedLabel
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.summaryHeader}>
                <Text style={styles.summaryLabel}>Customer: {customerName}</Text>
                <Text style={styles.summaryLabel}>{items.length} items added</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                <Text style={styles.totalLabel}>Total Amount</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Select Payment Mode</Text>
                <View style={styles.paymentGrid}>
                    {renderPaymentCard('CASH', 'cash', 'Cash')}
                    {renderPaymentCard('UPI', 'qrcode-scan', 'UPI')}
                    {renderPaymentCard('CARD', 'credit-card-outline', 'Card')}
                </View>

                {discount > 0 && (
                    <View style={styles.discountRow}>
                        <MaterialCommunityIcons name="tag-outline" size={20} color={Colors.success} />
                        <Text style={styles.discountText}>
                            Discount Applied: -{formatCurrency(discount)}
                        </Text>
                    </View>
                )}

                <View style={styles.totalBadgeContainer}>
                    <View style={styles.totalBadge}>
                        <Text style={styles.badgeLabel}>Final Payable</Text>
                        <Text style={styles.badgeValue}>{formatCurrency(total)}</Text>
                        {paymentMode && (
                            <View style={styles.modeBadge}>
                                <Text style={styles.modeBadgeText}>{paymentMode}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <AppButton
                    title="Confirm Payment"
                    onPress={handleConfirm}
                    disabled={!paymentMode}
                    fullWidth
                    size="lg"
                />
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={Colors.white} />
                    <Text style={styles.loadingText}>Processing Bill...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    summaryHeader: {
        backgroundColor: Colors.white,
        padding: Spacing.xl,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey100,
        ...Shadows.sm,
    },
    summaryLabel: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey500,
        marginBottom: 4,
    },
    totalValue: {
        fontSize: Typography.fontSizes.xxl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.primary,
        marginTop: Spacing.sm,
    },
    totalLabel: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey400,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 2,
    },
    content: {
        flex: 1,
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.lg,
    },
    paymentGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    paymentCard: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.grey200,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.sm,
    },
    selectedCard: {
        borderColor: Colors.primary,
        backgroundColor: '#FFF1F2',
    },
    paymentLabel: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.medium,
        color: Colors.grey600,
        marginTop: Spacing.sm,
    },
    selectedLabel: {
        color: Colors.primary,
        fontWeight: Typography.fontWeights.bold,
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.successLight,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.xl,
    },
    discountText: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.success,
        fontWeight: Typography.fontWeights.bold,
        marginLeft: Spacing.sm,
    },
    totalBadgeContainer: {
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    totalBadge: {
        backgroundColor: Colors.dark,
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        ...Shadows.lg,
    },
    badgeLabel: {
        color: Colors.grey400,
        fontSize: Typography.fontSizes.xs,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    badgeValue: {
        color: Colors.white,
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
    },
    modeBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: Spacing.sm,
    },
    modeBadgeText: {
        color: Colors.white,
        fontSize: 10,
        fontWeight: Typography.fontWeights.bold,
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: Colors.white,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: Colors.white,
        marginTop: Spacing.md,
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.medium,
    },
});
