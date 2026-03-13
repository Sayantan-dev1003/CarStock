import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal, Portal, Provider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { productsApi } from '../../../src/api/products.api';
import { inventoryApi } from '../../../src/api/inventory.api';
import { ProductCard } from '../../../src/components/inventory/ProductCard';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { AppInput } from '../../../src/components/common/AppInput';
import { AppButton } from '../../../src/components/common/AppButton';
import { Product, ProductCategory } from '../../../src/types/product.types';

const CATEGORIES: (ProductCategory | 'ALL' | 'LOW_STOCK')[] = [
  'ALL', 'LOW_STOCK', 'TYRES', 'BATTERIES', 'WIPERS', 'BRAKES', 'SEAT_COVERS', 'LIGHTING', 'AUDIO', 'OILS', 'ELECTRICAL', 'OTHER'
];

export default function InventoryScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL' | 'LOW_STOCK'>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addStockQty, setAddStockQty] = useState('');
  const [addStockNote, setAddStockNote] = useState('');

  const { 
    data: products, 
    isLoading, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['products', selectedCategory],
    queryFn: () => {
      if (selectedCategory === 'LOW_STOCK') {
          return productsApi.getLowStockProducts();
      }
      return productsApi.getProducts(1, 100, selectedCategory === 'ALL' ? undefined : selectedCategory as ProductCategory)
        .then(res => res.data);
    },
  });

  const { data: summary } = useQuery({
    queryKey: ['inventory-summary'],
    queryFn: () => inventoryApi.getInventorySummary(),
  });

  const addStockMutation = useMutation({
    mutationFn: (data: { productId: string; quantity: number; note?: string }) => 
      inventoryApi.addStock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-summary'] });
      setSelectedProduct(null);
      setAddStockQty('');
      setAddStockNote('');
    },
  });

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const handleAddStock = () => {
    if (!selectedProduct || !addStockQty) return;
    addStockMutation.mutate({
      productId: selectedProduct.id,
      quantity: parseInt(addStockQty),
      note: addStockNote || undefined
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppInput
          placeholder="Search inventory..."
          value={search}
          onChangeText={setSearch}
          leftIcon="magnify"
          containerStyle={styles.searchBar}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterBar}
          contentContainerStyle={styles.filterContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.activeFilterChip
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === cat && styles.activeFilterChipText
              ]}>
                {cat.replace(/_/g, ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{summary?.totalProducts || 0}</Text>
          <Text style={styles.summaryLabel}>Total Products</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.warning }]}>{summary?.lowStockCount || 0}</Text>
          <Text style={styles.summaryLabel}>Low Stock</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryValue, { color: Colors.error }]}>{summary?.outOfStockCount || 0}</Text>
          <Text style={styles.summaryLabel}>Out of Stock</Text>
        </View>
      </View>

      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductCard
            product={item as any}
            onAddStock={setSelectedProduct}
            onViewDetails={(p) => router.push(`/(app)/inventory/${p.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="package-variant"
            title="No products found"
            subtitle="Try adjusting your filters or search query"
          />
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/(app)/inventory/add-product')}
      >
        <MaterialCommunityIcons name="plus" size={30} color={Colors.white} />
      </TouchableOpacity>

      <Portal>
        <Modal
          visible={!!selectedProduct}
          onDismiss={() => setSelectedProduct(null)}
          contentContainerStyle={styles.modalContent}
        >
          <Text style={styles.modalTitle}>Add Stock</Text>
          <Text style={styles.modalSubtitle}>{selectedProduct?.name}</Text>
          <View style={styles.modalBody}>
            <AppInput
              label="Quantity to Add"
              value={addStockQty}
              onChangeText={setAddStockQty}
              keyboardType="numeric"
              placeholder="e.g. 10"
              autoFocus
            />
            <AppInput
              label="Note (Optional)"
              value={addStockNote}
              onChangeText={setAddStockNote}
              placeholder="e.g. Restock from supplier"
            />
            <AppButton
              title="Confirm Add Stock"
              onPress={handleAddStock}
              loading={addStockMutation.isPending}
              fullWidth
              style={styles.modalBtn}
            />
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.sm,
    ...Shadows.sm,
  },
  searchBar: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  filterBar: {
    paddingBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.base,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey600,
    fontWeight: Typography.fontWeights.medium,
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  summaryContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    margin: Spacing.base,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  summaryLabel: {
    fontSize: 10,
    color: Colors.grey500,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.grey100,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: Spacing.xl,
    bottom: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
    margin: Spacing.xl,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  modalSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey500,
    marginVertical: Spacing.xs,
  },
  modalBody: {
    marginTop: Spacing.md,
  },
  modalBtn: {
    marginTop: Spacing.md,
  },
});
