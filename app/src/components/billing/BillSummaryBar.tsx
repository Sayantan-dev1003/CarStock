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
        <View style={styles.detailsRow}>
          <TouchableOpacity style={styles.detailItem} onPress={onDiscountPress}>
            <Text style={styles.label}>Discount</Text>
            <Text style={[styles.value, discount > 0 && styles.discountValue]}>
              - {formatCurrency(discount)}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.detailItem}>
            <Text style={styles.label}>GST (18%)</Text>
            <Text style={styles.value}>{formatCurrency(gst)}</Text>
          </View>
          
          <View style={styles.totalItem}>
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
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  detailItem: {
    flex: 1,
  },
  totalItem: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
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
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 22,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
});
