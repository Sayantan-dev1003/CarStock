import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import { Customer } from '../../types/customer.types';

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onPress }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onPress(customer)}
      activeOpacity={0.7}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(customer.name)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.phone}>{customer.mobile}</Text>
        
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{(customer.bills || []).length} bills</Text>
          <Text style={styles.statsDivider}> • </Text>
          <Text style={styles.statsText}>{formatCurrency(customer.totalSpend)} spent</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  phone: {
    fontSize: 13,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 12,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.primary,
  },
  statsDivider: {
    fontSize: 12,
    color: theme.colors.border,
    marginHorizontal: 8,
  },
});
