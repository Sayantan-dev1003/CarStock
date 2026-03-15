import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
        ) : (
          <Ionicons name="cube-outline" size={24} color={theme.colors.textMuted} />
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
            {product.brand ? (
              <Text style={styles.brand} numberOfLines={1}>{product.brand}</Text>
            ) : null}
          </View>
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
    padding: 12,
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
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  name: {
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  brand: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: theme.radius.sm,
    resizeMode: 'cover',
  },
  categoryTag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.primary,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  stockText: {
    fontSize: 13,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  price: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
});
