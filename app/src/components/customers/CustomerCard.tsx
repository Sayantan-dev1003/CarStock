import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppCard } from '../common/AppCard';
import { formatCurrency } from '../../utils/format';
import { Customer } from '../../types/customer.types';

interface CustomerCardProps {
  customer: Customer;
  onPress: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onPress }) => {
  const getInitial = (name: string) => name.charAt(0).toUpperCase();
  
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'VIP': return Colors.primary;
      case 'REGULAR': return Colors.grey500;
      case 'INACTIVE': return Colors.grey300;
      default: return Colors.grey500;
    }
  };

  return (
    <AppCard onPress={() => onPress(customer)} style={styles.card}>
      <View style={styles.container}>
        <View style={[styles.avatar, { backgroundColor: getTagColor(customer.tag) + '20' }]}>
          <Text style={[styles.avatarText, { color: getTagColor(customer.tag) }]}>
            {getInitial(customer.name)}
          </Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{customer.name}</Text>
            <View style={[styles.tag, { backgroundColor: getTagColor(customer.tag) + '15' }]}>
              <Text style={[styles.tagText, { color: getTagColor(customer.tag) }]}>{customer.tag}</Text>
            </View>
          </View>
          <Text style={styles.mobile}>{customer.mobile}</Text>
          <View style={styles.stats}>
            <Text style={styles.statText}>{formatCurrency(customer.totalSpend)} spend • {(customer.bills || []).length} bills</Text>
          </View>
        </View>
        
        <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.grey400} />
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.xs,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginRight: Spacing.sm,
    flexShrink: 1,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
  },
  mobile: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey500,
    marginBottom: 4,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey400,
  },
});
