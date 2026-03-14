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

  const status = 'PAID'; 

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(bill)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.content}>
          <Text style={styles.customerName}>{bill.customer?.name || 'Walk-in Customer'}</Text>
          <Text style={styles.billId}>#{bill.billNumber}</Text>
          <Text style={styles.date}>{dayjs(bill.createdAt).format('DD MMM YYYY, hh:mm A')}</Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={styles.amount}>{formatCurrency(bill.total)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(status) }]}>{status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: 16,
    marginBottom: 12,
    ...theme.shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  billId: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  date: {
    fontSize: 11,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
  },
  statusText: {
    fontSize: 10,
    fontFamily: theme.font.bodySemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
