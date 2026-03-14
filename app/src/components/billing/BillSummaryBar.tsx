import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { AppButton } from '../common/AppButton';
import { formatCurrency } from '../../utils/format';
import { BillItem } from '../../types/billing.types';

interface BillSummaryBarProps {
  items: BillItem[];
  discount: number;
  onProceed: () => void;
  onDiscountPress: () => void;
}

export const BillSummaryBar: React.FC<BillSummaryBarProps> = ({
  items,
  discount,
  onProceed,
  onDiscountPress,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const gst = subtotal * 0.18; // 9% CGST + 9% SGST
  const total = subtotal + gst - discount;

  if (items.length === 0) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.label}>Subtotal</Text>
            <Text style={styles.value}>{formatCurrency(subtotal)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.label}>GST (18%)</Text>
            <Text style={styles.value}>{formatCurrency(gst)}</Text>
          </View>

          <TouchableOpacity style={styles.summaryRow} onPress={onDiscountPress}>
            <Text style={styles.label}>Discount</Text>
            <Text style={[styles.value, discount > 0 && styles.discountValue]}>
              - {formatCurrency(discount)}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <AppButton
          title={`Checkout (${items.length} ${items.length === 1 ? 'item' : 'items'})`}
          onPress={onProceed}
          size="lg"
          rightIcon="arrow-forward"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.colors.bgCard,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    ...theme.shadow.lg,
  },
  container: {
    padding: 20,
    backgroundColor: theme.colors.bg,
  },
  summaryCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.bgMuted,
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  discountValue: {
    color: theme.colors.success,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
});
