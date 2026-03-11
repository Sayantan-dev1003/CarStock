import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppButton } from '../common/AppButton';
import { StockBadge } from './StockBadge';
import { Colors, Typography, Spacing } from '../../constants/theme';
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
    const categoryColors: Record<string, string> = {
        TYRES: '#3B82F6',
        BATTERIES: '#F59E0B',
        WIPERS: '#10B981',
        BRAKES: '#EF4444',
        OILS: '#8B5CF6',
        OTHER: '#6B7280',
    };

    const dotColor = categoryColors[product.category] || Colors.primary;

    return (
        <AppCard style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleSection}>
                    <View style={[styles.categoryDot, { backgroundColor: dotColor }]} />
                    <View>
                        <Text style={styles.name}>{product.name}</Text>
                        <Text style={styles.skuBrand}>
                            {product.sku} • {product.brand}
                        </Text>
                    </View>
                </View>
                <View style={styles.stockSection}>
                    <Text style={[
                        styles.quantity,
                        { color: product.quantity <= product.reorderLevel ? Colors.error : Colors.success }
                    ]}>
                        {product.quantity}
                    </Text>
                    <StockBadge
                        quantity={product.quantity}
                        reorderLevel={product.reorderLevel}
                        size="sm"
                    />
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.price}>₹{product.sellingPrice.toLocaleString()}</Text>
                <View style={styles.actions}>
                    <AppButton
                        title="Add Stock"
                        onPress={() => onAddStock(product)}
                        variant="outline"
                        size="sm"
                        style={styles.actionBtn}
                    />
                    <TouchableOpacity onPress={() => onViewDetails(product)}>
                        <Text style={styles.detailsLink}>View Details</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </AppCard>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.md,
    },
    titleSection: {
        flexDirection: 'row',
        flex: 1,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: Spacing.sm,
    },
    name: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    skuBrand: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
        marginTop: 2,
    },
    stockSection: {
        alignItems: 'flex-end',
    },
    quantity: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        marginBottom: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.grey100,
        paddingTop: Spacing.sm,
    },
    price: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        marginRight: Spacing.md,
    },
    detailsLink: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.primary,
        fontWeight: Typography.fontWeights.medium,
    },
});
