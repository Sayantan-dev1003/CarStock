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
      <View style={styles.topRow}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.unitPrice}>
            {formatCurrency(item.unitPrice)} per unit
          </Text>
        </View>
        <Text style={styles.lineTotal}>
          {formatCurrency(item.unitPrice * item.quantity)}
        </Text>
      </View>
      
      <View style={styles.bottomRow}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.qtyBtn} 
            onPress={() => item.quantity > 1 ? onQuantityChange(item.productId, item.quantity - 1) : onRemove(item.productId)}
          >
            <MaterialCommunityIcons 
              name={item.quantity > 1 ? "minus" : "trash-can-outline"} 
              size={18} 
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
            <MaterialCommunityIcons name="plus" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => onRemove(item.productId)} style={styles.removeBtn}>
          <Text style={styles.removeText}>Remove Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgCard,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  info: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  name: {
    fontSize: 16,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  unitPrice: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  lineTotal: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgMuted,
    borderRadius: theme.radius.sm,
    padding: 2,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyDisplay: {
    minWidth: 44,
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 15,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  removeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.error,
  },
});
