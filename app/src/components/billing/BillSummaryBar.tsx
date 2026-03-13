import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../constants/theme';
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
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
          </View>
        </View>

        <AppButton
          title={`Checkout (${items.length} ${items.length === 1 ? 'item' : 'items'})`}
          onPress={onProceed}
          size="lg"
          rightIcon="arrow-right"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.white,
    ...Shadows.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.grey100,
  },
  container: {
    padding: Spacing.base,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  detailItem: {
    flex: 1,
  },
  totalItem: {
    flex: 1.2,
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 10,
    color: Colors.grey500,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  value: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.dark,
  },
  discountValue: {
    color: Colors.success,
  },
  totalLabel: {
    fontSize: 10,
    color: Colors.grey500,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  totalValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  button: {
    width: '100%',
  },
});
