import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../../../src/context/ThemeContext';
import { productsApi } from '../../../../src/api/products.api';
import { ProductCard } from '../../../../src/components/inventory/ProductCard';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { ProductCategory } from '../../../../src/types/product.types';
import { AppHeader } from '../../../../src/components/common/AppHeader';
import { MetricCard } from '../../../../src/components/dashboard/MetricCard';

const CATEGORIES: (ProductCategory | 'ALL' | 'LOW_STOCK')[] = [
  'ALL', 'LOW_STOCK', 'TYRES', 'BATTERIES', 'WIPERS', 'BRAKES', 'SEAT_COVERS', 'LIGHTING', 'AUDIO', 'OILS', 'ELECTRICAL', 'OTHER'
];

export default function InventoryScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL' | 'LOW_STOCK'>('ALL');

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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter((p: any) => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.sku.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  const stats = useMemo(() => {
    if (!products) return { total: 0, lowStock: 0, outOfStock: 0 };
    return {
      total: products.length,
      lowStock: products.filter((p: any) => p.quantity > 0 && p.quantity <= 10).length,
      outOfStock: products.filter((p: any) => p.quantity === 0).length,
    };
  }, [products]);



  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader 
        title="Inventory" 
        subtitle="Manage your products and stock"
        rightAction={{
          icon: 'add',
          onPress: () => router.push('/(app)/inventory/add-product'),
        }}
      />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search products..."
              placeholderTextColor={theme.colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Total"
              value={stats.total}
              icon="cube-outline"
              variant="primary"
            />
            <MetricCard
              title="Low Stock"
              value={stats.lowStock}
              icon="alert-circle-outline"
            />
            <MetricCard
              title="Out of Stock"
              value={stats.outOfStock}
              icon="close-circle-outline"
            />
          </View>
        </View>

        {/* Categories Filter */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.filterContent}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.filterPill,
                    isActive ? styles.activeFilterPill : styles.inactiveFilterPill
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterText,
                    isActive ? styles.activeFilterText : styles.inactiveFilterText
                  ]}>
                    {cat.replace(/_/g, ' ')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item as any}
              onViewDetails={(p) => router.push(`/(app)/inventory/${p.id}`)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={refetch} 
              colors={[theme.colors.primary]} 
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            isLoading ? (
              <LoadingSpinner message="Loading products..." />
            ) : (
              <EmptyState
                icon="cube-outline"
                title="No products found"
                subtitle="Try adjusting your filters or search query"
              />
            )
          }
        />
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.font.body,
    color: theme.colors.textPrimary,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  activeFilterPill: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inactiveFilterPill: {
    backgroundColor: theme.colors.bgCard,
    borderColor: theme.colors.border,
  },
  filterText: {
    fontSize: 13,
    fontFamily: theme.font.bodySemiBold,
  },
  activeFilterText: {
    color: theme.colors.bgCard,
  },
  inactiveFilterText: {
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});


}
