import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppButton } from '../common/AppButton';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../constants/theme';
import { useBillingStore } from '../../store/billing.store';

interface BillSummaryBarProps {
    onProceed: () => void;
    disabled?: boolean;
}

export const BillSummaryBar: React.FC<BillSummaryBarProps> = ({ onProceed, disabled }) => {
    const { items, discount, getSubtotal, getTotal } = useBillingStore();
    const subtotal = getSubtotal();
    const total = getTotal();
    const discountedAmount = subtotal - discount;
    const cgst = discountedAmount * 0.09;
    const sgst = discountedAmount * 0.09;

    if (items.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.details}>
                <View style={styles.row}>
                    <Text style={styles.label}>Subtotal</Text>
                    <Text style={styles.value}>₹{subtotal.toFixed(2)}</Text>
                </View>
                {discount > 0 && (
                    <View style={styles.row}>
                        <Text style={[styles.label, { color: Colors.success }]}>Discount</Text>
                        <Text style={[styles.value, { color: Colors.success }]}>-₹{discount.toFixed(2)}</Text>
                    </View>
                )}
                <View style={styles.row}>
                    <Text style={styles.label}>GST (18%)</Text>
                    <Text style={styles.value}>₹{(cgst + sgst).toFixed(2)}</Text>
                </View>
                <View style={[styles.row, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{total.toFixed(2)}</Text>
                </View>
            </View>

            <AppButton
                title="Proceed to Checkout"
                onPress={onProceed}
                disabled={disabled}
                fullWidth
                size="lg"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        ...Shadows.lg,
    },
    details: {
        marginBottom: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
    },
    label: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey500,
    },
    value: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.dark,
    },
    totalRow: {
        marginTop: Spacing.xs,
        paddingTop: Spacing.xs,
        borderTopWidth: 1,
        borderTopColor: Colors.grey100,
    },
    totalLabel: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    totalValue: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.primary,
    },
});
