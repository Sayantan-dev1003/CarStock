import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import { Bill } from '../../types/billing.types';
import dayjs from 'dayjs';

interface BillCardProps {
  bill: Bill;
  onPress: (bill: Bill) => void;
}

export const BillCard: React.FC<BillCardProps> = ({ bill, onPress }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return theme.colors.success;
      case 'PENDING': return theme.colors.warning;
      case 'OVERDUE': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const status = bill.status || 'PAID'; 

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(bill)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.customerSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(bill.customer?.name || 'W').charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.customerName} numberOfLines={1}>
              {bill.customer?.name || 'Walk-in Customer'}
            </Text>
            <Text style={styles.billId}>#{bill.billNumber}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: getStatusColor(status) + '10' }
        ]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(status) }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.footer}>
        <View>
          <Text style={styles.dateLabel}>Invoice Date</Text>
          <Text style={styles.dateValue}>{dayjs(bill.createdAt).format('DD MMM, YYYY')}</Text>
        </View>
        <View style={styles.amountSection}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>{formatCurrency(bill.total)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.primary,
  },
  customerName: {
    fontSize: 16,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  billId: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontFamily: theme.font.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textSecondary,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amountLabel: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
});
