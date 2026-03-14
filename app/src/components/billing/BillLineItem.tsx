import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import { BillItem } from '../../types/billing.types';

interface BillLineItemProps {
  item: BillItem;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

export const BillLineItem: React.FC<BillLineItemProps> = ({
  item,
  onQuantityChange,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.unitPrice}>
          {formatCurrency(item.unitPrice)} per unit
        </Text>
      </View>
      
      <View style={styles.rightContent}>
        <Text style={styles.lineTotal}>
          {formatCurrency(item.unitPrice * item.quantity)}
        </Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => item.quantity > 1 ? onQuantityChange(item.productId, item.quantity - 1) : onRemove(item.productId)}
          >
            <MaterialCommunityIcons 
              name={item.quantity > 1 ? "minus" : "trash-can-outline"} 
              size={16} 
              color={item.quantity > 1 ? theme.colors.textSecondary : theme.colors.error} 
            />
          </TouchableOpacity>
          
          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyText}>{item.quantity}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.qtyBtn}
            onPress={() => onQuantityChange(item.productId, item.quantity + 1)}
          >
            <MaterialCommunityIcons name="plus" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgCard,
    padding: 16,
    borderRadius: theme.radius.md,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadow.sm,
  },
  leftContent: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  unitPrice: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  lineTotal: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 12,
    padding: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyDisplay: {
    minWidth: 36,
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 14,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
});
