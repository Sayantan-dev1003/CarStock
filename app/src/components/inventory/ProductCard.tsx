import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { AppCard } from '../common/AppCard';
import { AppButton } from '../common/AppButton';
import { StockBadge } from './StockBadge';
import { formatCurrency } from '../../utils/format';
import { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  onAddStock: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddStock,
  onViewDetails,
}) => {
  const isLowStock = product.quantity <= product.reorderLevel;

  return (
    <AppCard style={styles.card} onPress={() => onViewDetails(product)}>
      <View style={styles.row}>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(product.category) }]} />
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          </View>
          <Text style={styles.sku}>SKU: {product.sku} • {product.brand}</Text>
          <Text style={styles.price}>{formatCurrency(product.sellingPrice)}</Text>
        </View>
        
        <View style={styles.stockInfo}>
          <Text style={[
            styles.quantity,
            { color: product.quantity === 0 ? Colors.error : isLowStock ? Colors.warning : Colors.success }
          ]}>
            {product.quantity}
          </Text>
          <StockBadge quantity={product.quantity} reorderLevel={product.reorderLevel} />
        </View>
      </View>

      <View style={styles.footer}>
        <AppButton 
          title="Add Stock" 
          variant="outline" 
          size="sm" 
          leftIcon="plus"
          onPress={() => onAddStock(product)}
          style={styles.actionButton}
        />
        <TouchableOpacity onPress={() => onViewDetails(product)} style={styles.viewLink}>
          <Text style={styles.viewLinkText}>View Details</Text>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </AppCard>
  );
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'TYRES': return '#3B82F6';
    case 'BATTERIES': return '#F59E0B';
    case 'BRAKES': return '#EF4444';
    case 'OILS': return '#10B981';
    case 'LIGHTING': return '#8B5CF6';
    default: return Colors.grey400;
  }
};

const styles = StyleSheet.create({
  card: {
    marginVertical: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  info: {
    flex: 1,
    marginRight: Spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  name: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    flex: 1,
  },
  sku: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  stockInfo: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  quantity: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    marginBottom: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  actionButton: {
    minHeight: 32,
    paddingHorizontal: Spacing.md,
  },
  viewLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewLinkText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeights.medium,
    marginRight: 2,
  },
});
