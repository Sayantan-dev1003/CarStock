import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Share,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { productsApi } from '../../../src/api/products.api';
import { inventoryApi } from '../../../src/api/inventory.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { StockBadge } from '../../../src/components/inventory/StockBadge';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { AppButton } from '../../../src/components/common/AppButton';

export default function ProductDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [historyPage, setHistoryPage] = useState(1);

    const { data: product, isLoading: isProductLoading } = useQuery({
        queryKey: ['product', id],
        queryFn: () => productsApi.getProduct(id as string),
    });

    const { data: history, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['stock-history', id, historyPage],
        queryFn: () => inventoryApi.getStockHistory(id as string, historyPage, 10),
    });

    const handleShareQR = async () => {
        if (!product) return;
        try {
            await Share.share({
                message: `Product SKU: ${product.sku}\nName: ${product.name}`,
                title: 'Share Product Info',
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    if (isProductLoading) return <LoadingSpinner />;
    if (!product) return <Text>Product not found</Text>;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            {/* Header / Info Section */}
            <View style={styles.header}>
                <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.sku}>{product.sku}</Text>
                        <Text style={styles.name}>{product.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.qrButton} onPress={handleShareQR}>
                        <MaterialCommunityIcons name="qrcode" size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.badgeRow}>
                    <StockBadge quantity={product.quantity} reorderLevel={product.reorderLevel} />
                    <View style={styles.categoryBadge}>
                        <Text style={styles.categoryText}>{product.category}</Text>
                    </View>
                </View>

                <View style={styles.priceContainer}>
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Selling Price</Text>
                        <Text style={styles.priceValue}>{formatCurrency(product.sellingPrice)}</Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View style={styles.priceItem}>
                        <Text style={styles.priceLabel}>Current Stock</Text>
                        <Text style={styles.priceValue}>{product.quantity} units</Text>
                    </View>
                </View>
            </View>

            {/* Description Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Product Details</Text>
                <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Brand</Text>
                        <Text style={styles.detailValue}>{product.brand || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Reorder Level</Text>
                        <Text style={styles.detailValue}>{product.reorderLevel}</Text>
                    </View>
                </View>
                {product.description && (
                    <Text style={styles.description}>{product.description}</Text>
                )}
            </View>

            {/* Stock History Section */}
            <View style={styles.section}>
                <View style={styles.historyHeader}>
                    <Text style={styles.sectionTitle}>Stock History</Text>
                    <MaterialCommunityIcons name="history" size={20} color={Colors.grey400} />
                </View>

                {isHistoryLoading ? (
                    <ActivityIndicator color={Colors.primary} style={{ margin: Spacing.xl }} />
                ) : history?.data && history.data.length > 0 ? (
                    <View style={styles.historyList}>
                        {history.data.map((log: any) => (
                            <View key={log.id} style={styles.historyItem}>
                                <View style={[
                                    styles.changeIcon,
                                    { backgroundColor: log.type === 'ADDITION' ? Colors.successLight : Colors.errorLight }
                                ]}>
                                    <MaterialCommunityIcons
                                        name={log.type === 'ADDITION' ? 'plus' : 'minus'}
                                        size={16}
                                        color={log.type === 'ADDITION' ? Colors.success : Colors.error}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: Spacing.md }}>
                                    <View style={styles.historyRow}>
                                        <Text style={styles.historyAction}>
                                            {log.type === 'ADDITION' ? 'Stock Added' : 'Stock reduced (Sold)'}
                                        </Text>
                                        <Text style={[
                                            styles.historyQty,
                                            { color: log.type === 'ADDITION' ? Colors.success : Colors.error }
                                        ]}>
                                            {log.type === 'ADDITION' ? '+' : '-'}{log.quantity}
                                        </Text>
                                    </View>
                                    <View style={styles.historyRow}>
                                        <Text style={styles.historyNote}>{log.note || 'No notes'}</Text>
                                        <Text style={styles.historyDate}>{formatDate(log.createdAt)}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.emptyHistory}>No stock updates yet</Text>
                )}
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <AppButton
                    title="Edit Product"
                    onPress={() => router.push({
                        pathname: '/(app)/inventory/add-product',
                        params: { id: product.id }
                    })}
                    variant="outline"
                    icon="pencil-outline"
                    style={{ flex: 1, marginRight: Spacing.sm }}
                />
                <AppButton
                    title="Add Stock"
                    onPress={() => { }} // Could trigger the same modal but for simplicity let's skip for now
                    icon="plus"
                    style={{ flex: 1.5 }}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    header: {
        backgroundColor: Colors.white,
        padding: Spacing.xl,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        ...Shadows.md,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    sku: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.primary,
        marginBottom: 2,
    },
    name: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    qrButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#FFF1F2',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    categoryBadge: {
        backgroundColor: Colors.grey100,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: Spacing.sm,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.grey600,
        textTransform: 'uppercase',
    },
    priceContainer: {
        flexDirection: 'row',
        backgroundColor: Colors.dark,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
    },
    priceItem: {
        flex: 1,
        alignItems: 'center',
    },
    priceDivider: {
        width: 1,
        backgroundColor: '#404060',
        marginHorizontal: Spacing.md,
    },
    priceLabel: {
        fontSize: 10,
        color: Colors.grey400,
        marginBottom: 4,
        textTransform: 'uppercase',
    },
    priceValue: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.white,
    },
    section: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.lg,
    },
    detailGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: Spacing.md,
    },
    detailItem: {
        width: '50%',
        marginBottom: Spacing.md,
    },
    detailLabel: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.medium,
        color: Colors.dark,
    },
    description: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey600,
        lineHeight: 20,
    },
    historyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    historyList: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        ...Shadows.sm,
    },
    historyItem: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.grey100,
    },
    changeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    historyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    historyAction: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    historyQty: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.bold,
    },
    historyNote: {
        fontSize: 10,
        color: Colors.grey500,
    },
    historyDate: {
        fontSize: 10,
        color: Colors.grey400,
    },
    emptyHistory: {
        textAlign: 'center',
        color: Colors.grey400,
        padding: Spacing.xl,
    },
    actions: {
        flexDirection: 'row',
        padding: Spacing.lg,
        marginTop: Spacing.xl,
    },
});
