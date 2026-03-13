import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
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
              size={20} 
              color={item.quantity > 1 ? Colors.grey600 : Colors.error} 
            />
          </TouchableOpacity>
          
          <View style={styles.qtyDisplay}>
            <Text style={styles.qtyText}>{item.quantity}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.qtyBtn}
            onPress={() => onQuantityChange(item.productId, item.quantity + 1)}
          >
            <MaterialCommunityIcons name="plus" size={20} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => onRemove(item.productId)} style={styles.removeBtn}>
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.grey100,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  name: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  unitPrice: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  lineTotal: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.grey100,
    borderRadius: BorderRadius.sm,
    padding: 2,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyDisplay: {
    minWidth: 40,
    alignItems: 'center',
  },
  qtyText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  removeBtn: {
    paddingVertical: 4,
  },
  removeText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.error,
    fontWeight: Typography.fontWeights.medium,
  },
});
