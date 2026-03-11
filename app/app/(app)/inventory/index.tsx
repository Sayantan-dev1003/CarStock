import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { productsApi } from '../../../src/api/products.api';
import { inventoryApi } from '../../../src/api/inventory.api';
import { ProductCard } from '../../../src/components/inventory/ProductCard';
import { AppInput } from '../../../src/components/common/AppInput';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { useDebounce } from '../../../src/hooks/useDebounce';
import { Modal, Portal, FAB } from 'react-native-paper';

const CATEGORIES = [
    'ALL', 'LOW STOCK', 'OUT OF STOCK',
    'TYRES', 'BATTERIES', 'BRAKES', 'OILS', 'WIPERS', 'LIGHTING', 'AUDIO', 'OTHER'
];

export default function InventoryScreen() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [isAddStockVisible, setIsAddStockVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [addStockQty, setAddStockQty] = useState('');
    const [page, setPage] = useState(1);

    const debouncedSearch = useDebounce(search, 500);

    const {
        data: inventoryData,
        isLoading,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['products', debouncedSearch, selectedCategory, page],
        queryFn: () => productsApi.getProducts({
            page,
            limit: 20,
            category: selectedCategory === 'ALL' || selectedCategory === 'LOW STOCK' || selectedCategory === 'OUT OF STOCK' ? undefined : selectedCategory,
        }),
    });

    const { data: summary } = useQuery({
        queryKey: ['inventory-summary'],
        queryFn: inventoryApi.getInventorySummary,
    });

    const addStockMutation = useMutation({
        mutationFn: inventoryApi.addStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
            setIsAddStockVisible(false);
            setAddStockQty('');
        },
    });

    const handleAddStock = (product: any) => {
        setSelectedProduct(product);
        setIsAddStockVisible(true);
    };

    const confirmAddStock = () => {
        if (!selectedProduct || !addStockQty) return;
        addStockMutation.mutate({
            productId: selectedProduct.id,
            quantity: parseInt(addStockQty, 10),
        });
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryLabel}>Total Products</Text>
                    <Text style={styles.summaryValue}>{summary?.totalProducts || 0}</Text>
                </View>
                <View style={[styles.summaryItem, { borderLeftWidth: 1, borderLeftColor: Colors.grey200 }]}>
                    <Text style={[styles.summaryLabel, { color: Colors.warning }]}>Low Stock</Text>
                    <Text style={[styles.summaryValue, { color: Colors.warning }]}>{summary?.lowStockCount || 0}</Text>
                </View>
                <View style={[styles.summaryItem, { borderLeftWidth: 1, borderLeftColor: Colors.grey200 }]}>
                    <Text style={[styles.summaryLabel, { color: Colors.error }]}>Out of Stock</Text>
                    <Text style={[styles.summaryValue, { color: Colors.error }]}>{summary?.outOfStockCount || 0}</Text>
                </View>
            </View>

            <AppInput
                label=""
                placeholder="Search products by name or SKU..."
                value={search}
                onChangeText={setSearch}
                leftIcon="magnify"
                containerStyle={styles.searchBar}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat}
                        style={[
                            styles.categoryChip,
                            selectedCategory === cat && styles.activeCategoryChip,
                        ]}
                        onPress={() => setSelectedCategory(cat)}
                    >
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === cat && styles.activeCategoryText,
                        ]}>
                            {cat}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={inventoryData?.data || []}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <ProductCard
                        product={item}
                        onAddStock={handleAddStock}
                        onViewDetails={(p) => router.push({
                            pathname: '/(app)/inventory/product-detail',
                            params: { id: p.id }
                        })}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
                }
                ListEmptyComponent={
                    isLoading ? <LoadingSpinner /> : (
                        <EmptyState
                            icon="package-variant"
                            title="No products found"
                            subtitle="Try adjusting your filters or search query"
                        />
                    )
                }
            />

            <FAB
                icon="plus"
                style={styles.fab}
                color={Colors.white}
                onPress={() => router.push('/(app)/inventory/add-product')}
            />

            <Portal>
                <Modal
                    visible={isAddStockVisible}
                    onDismiss={() => setIsAddStockVisible(false)}
                    contentContainerStyle={styles.modalContent}
                >
                    <Text style={styles.modalTitle}>Add Stock</Text>
                    {selectedProduct && (
                        <>
                            <Text style={styles.modalProduct}>{selectedProduct.name}</Text>
                            <Text style={styles.modalCurrent}>Current Stock: {selectedProduct.quantity}</Text>
                            <AppInput
                                label="Quantity to Add"
                                placeholder="e.g. 10"
                                value={addStockQty}
                                onChangeText={setAddStockQty}
                                keyboardType="numeric"
                            />
                            <AppButton
                                title="Add Stock"
                                onPress={confirmAddStock}
                                loading={addStockMutation.isPending}
                                fullWidth
                                style={{ marginTop: Spacing.md }}
                            />
                        </>
                    )}
                </Modal>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    listContent: {
        paddingBottom: 100,
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    summaryRow: {
        flexDirection: 'row',
        backgroundColor: Colors.offWhite,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
    },
    summaryItem: {
        flex: 1,
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 10,
        color: Colors.grey500,
        textTransform: 'uppercase',
        fontWeight: Typography.fontWeights.bold,
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    searchBar: {
        marginBottom: Spacing.md,
    },
    categoryScroll: {
        flexDirection: 'row',
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.grey100,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    activeCategoryChip: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    categoryText: {
        fontSize: Typography.fontSizes.xs,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.grey600,
    },
    activeCategoryText: {
        color: Colors.white,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.primary,
    },
    modalContent: {
        backgroundColor: Colors.white,
        padding: Spacing.xl,
        margin: Spacing.xl,
        borderRadius: BorderRadius.lg,
    },
    modalTitle: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.xs,
    },
    modalProduct: {
        fontSize: Typography.fontSizes.base,
        color: Colors.grey600,
        marginBottom: 4,
    },
    modalCurrent: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey400,
        marginBottom: Spacing.lg,
    },
});
