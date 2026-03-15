import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../../src/constants/theme';
import { AppButton } from '../../../src/components/common/AppButton';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { useBillingStore } from '../../../src/store/billing.store';
import { useBillCreation } from '../../../src/hooks/useBillCreation';
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

    const { createBill, status, result, error, reset } = useBillCreation();
    const total = getTotal();

    useEffect(() => {
        if (status === 'COMPLETED' && result) {
            router.replace({
                pathname: '/(app)/billing/bill-success',
                params: { bill: JSON.stringify(result) },
            });
            clearBill();
        } else if (status === 'FAILED' && error) {
            Alert.alert('Error', error);
            if (error.toLowerCase().includes('stock')) {
                router.back();
            }
        }
    }, [status, result, error]);

    const handleConfirm = async () => {
        if (!paymentMode || !customerId) return;

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

        await createBill(payload);
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
                <Ionicons
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
                        <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <AppHeader title="Payment" showBackButton />
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.summaryHeader}>
                    <View style={styles.customerInfo}>
                        <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
                            <Text style={styles.avatarText}>{(customerName || 'C').charAt(0).toUpperCase()}</Text>
                        </View>
                        <View>
                            <Text style={styles.customerName}>{customerName || 'Customer'}</Text>
                            <Text style={styles.itemCount}>{items.length} items added</Text>
                        </View>
                    </View>
                    
                    <View style={styles.amountCard}>
                        <Text style={styles.totalLabel}>Grand Total Amount</Text>
                        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.sectionTitle}>Select Payment Mode</Text>
                    <View style={styles.paymentGrid}>
                        {renderPaymentCard('CASH', 'cash-outline', 'Cash')}
                        {renderPaymentCard('UPI', 'qr-code-outline', 'UPI')}
                        {renderPaymentCard('CARD', 'card-outline', 'Card')}
                    </View>

                    {discount > 0 && (
                        <View style={styles.discountRow}>
                            <Ionicons name="pricetag-outline" size={20} color={theme.colors.success} />
                            <Text style={styles.discountText}>
                                Discount Applied: -{formatCurrency(discount)}
                            </Text>
                        </View>
                    )}

                    <AppButton
                        title={`Confirm & Generate Bill • ${formatCurrency(total)}`}
                        onPress={handleConfirm}
                        disabled={!paymentMode}
                        loading={status === 'PROCESSING'}
                        size="lg"
                        style={styles.confirmBtn}
                        rightIcon="arrow-forward"
                    />
                    
                    <Text style={styles.termsText}>
                        By confirming, you agree to generate a digital invoice for the customer.
                    </Text>
                </View>
            </ScrollView>

            {status === 'PROCESSING' && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>Finalizing Bill...</Text>
                    <Text style={styles.subLoadingText}>Generating PDF & Sending Invoice</Text>
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
    scrollContent: {
        paddingBottom: 40,
    },
    summaryHeader: {
        padding: 24,
        gap: 24,
    },
    customerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 20,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.primary,
    },
    customerName: {
        fontSize: 18,
        fontFamily: theme.font.heading,
        color: theme.colors.textPrimary,
    },
    itemCount: {
        fontSize: 13,
        fontFamily: theme.font.body,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    amountCard: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
        ...theme.shadow.sm,
    },
    totalLabel: {
        fontSize: 11,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
    },
    totalValue: {
        fontSize: 40,
        fontFamily: theme.font.heading,
        color: theme.colors.primary,
        letterSpacing: -1,
    },
    content: {
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.textPrimary,
        marginBottom: 20,
    },
    paymentGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    paymentCard: {
        flex: 1,
        aspectRatio: 1,
        backgroundColor: theme.colors.bgCard,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadow.sm,
    },
    selectedCard: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '08',
    },
    paymentLabel: {
        fontSize: 14,
        fontFamily: theme.font.bodyMedium,
        color: theme.colors.textSecondary,
        marginTop: 10,
    },
    selectedLabel: {
        color: theme.colors.primary,
        fontFamily: theme.font.bodyBold,
    },
    selectedIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.success + '10',
        padding: 16,
        borderRadius: 16,
        marginBottom: 32,
    },
    discountText: {
        fontSize: 14,
        fontFamily: theme.font.bodyBold,
        color: theme.colors.success,
        marginLeft: 12,
    },
    confirmBtn: {
        marginTop: 8,
    },
    termsText: {
        fontSize: 12,
        fontFamily: theme.font.body,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
        lineHeight: 18,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
    subLoadingText: {
        color: 'rgba(255, 255, 255, 0.7)',
        marginTop: 8,
        fontSize: 13,
        fontFamily: theme.font.body,
    },
});
