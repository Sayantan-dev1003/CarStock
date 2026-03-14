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
import { theme } from '../../../src/constants/theme';
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
                activeOpacity={0.7}
            >
                <MaterialCommunityIcons
                    name={icon as any}
                    size={32}
                    color={isSelected ? theme.colors.primary : theme.colors.textMuted}
                />
                <Text style={[
                    styles.paymentLabel,
                    isSelected && styles.selectedLabel
                ]}>
                    {label}
                </Text>
                {isSelected && (
                    <View style={styles.selectedIndicator}>
                        <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.summaryHeader}>
                <Text style={styles.summaryInfo}>Customer: {customerName}</Text>
                <Text style={styles.summaryInfo}>{items.length} items added</Text>
                <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                <Text style={styles.totalLabel}>Grand Total Amount</Text>
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
                        <MaterialCommunityIcons name="tag-outline" size={20} color={theme.colors.success} />
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
                    title="Confirm & Generate Bill"
                    onPress={handleConfirm}
                    disabled={!paymentMode}
                    fullWidth
                    size="lg"
                    rightIcon="arrow-forward"
                />
            </View>

            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Processing Transaction...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bg,
    },
    summaryHeader: {
        backgroundColor: theme.colors.bgCard,
        padding: 32,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        ...theme.shadow.sm,
    },
    summaryInfo: {
        fontSize: 14,
        fontFamily: theme.font.body,
        color: theme.colors.textSecondary,
        marginBottom: 4,
    },
    totalValue: {
        fontSize: 32,
        fontFamily: theme.font.heading,
        color: theme.colors.primary,
        marginTop: 12,
        letterSpacing: -1,
    },
    totalLabel: {
        fontSize: 10,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: 4,
    },
    content: {
        flex: 1,
        padding: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.textPrimary,
        marginBottom: 20,
    },
    paymentGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    paymentCard: {
        width: '30%',
        aspectRatio: 1,
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadow.sm,
        position: 'relative',
    },
    selectedCard: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primaryLight,
    },
    paymentLabel: {
        fontSize: 14,
        fontFamily: theme.font.bodyMedium,
        color: theme.colors.textSecondary,
        marginTop: 8,
    },
    selectedLabel: {
        color: theme.colors.primary,
        fontFamily: theme.font.bodyBold,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '15',
        padding: 16,
        borderRadius: theme.radius.md,
        marginBottom: 32,
    },
    discountText: {
        fontSize: 14,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.success,
        marginLeft: 12,
    },
    totalBadgeContainer: {
        alignItems: 'center',
        marginTop: 8,
    },
    totalBadge: {
        backgroundColor: theme.colors.textPrimary, // Very dark background
        paddingVertical: 24,
        paddingHorizontal: 40,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        ...theme.shadow.lg,
    },
    badgeLabel: {
        color: theme.colors.textMuted,
        fontSize: 10,
        fontFamily: theme.font.bodyBold,
        textTransform: 'uppercase',
        marginBottom: 6,
        letterSpacing: 0.5,
    },
    badgeValue: {
        color: theme.colors.bgCard,
        fontSize: 24,
        fontFamily: theme.font.heading,
    },
    modeBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: theme.radius.sm,
        marginTop: 12,
    },
    modeBadgeText: {
        color: theme.colors.bgCard,
        fontSize: 11,
        fontFamily: theme.font.bodyBold,
        textTransform: 'uppercase',
    },
    footer: {
        padding: 24,
        backgroundColor: theme.colors.bgCard,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(28, 25, 23, 0.7)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    loadingText: {
        color: 'white',
        marginTop: 16,
        fontSize: 16,
        fontFamily: theme.font.bodySemiBold,
    },
});
