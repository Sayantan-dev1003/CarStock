import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';
import { Product } from '../../types/product.types';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
}) => {
  const isLowStock = product.quantity <= 10;
  const isOutOfStock = product.quantity === 0;

  const getStockColor = () => {
    if (isOutOfStock) return theme.colors.error;
    if (isLowStock) return theme.colors.warning;
    return theme.colors.success;
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => onViewDetails(product)}
      activeOpacity={0.7}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons name="cube-outline" size={24} color={theme.colors.textMuted} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <View style={styles.categoryTag}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.stockRow}>
            <View style={[styles.stockDot, { backgroundColor: getStockColor() }]} />
            <Text style={styles.stockText}>{product.quantity} in stock</Text>
          </View>
          <Text style={styles.price}>{formatCurrency(product.sellingPrice)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    ...theme.shadow.card,
  },
  imagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  name: {
    fontSize: 16,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  categoryTag: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  stockText: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    letterSpacing: -0.5,
  },
});
