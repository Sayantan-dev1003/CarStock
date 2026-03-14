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
import { theme } from '../../../../src/constants/theme';
import { productsApi } from '../../../../src/api/products.api';
import { ProductCard } from '../../../../src/components/inventory/ProductCard';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { ProductCategory } from '../../../../src/types/product.types';
import { AppHeader } from '../../../../src/components/common/AppHeader';

const CATEGORIES: (ProductCategory | 'ALL' | 'LOW_STOCK')[] = [
  'ALL', 'LOW_STOCK', 'TYRES', 'BATTERIES', 'WIPERS', 'BRAKES', 'SEAT_COVERS', 'LIGHTING', 'AUDIO', 'OILS', 'ELECTRICAL', 'OTHER'
];

export default function InventoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 64;
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

  const lowStockCount = useMemo(() => {
    if (!products) return 0;
    return products.filter((p: any) => p.quantity <= 10).length;
  }, [products]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader 
        title="Inventory" 
        subtitle="Manage your products and stock"
      />
      
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#A8A29E" style={styles.searchIcon} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#A8A29E"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <View style={styles.statsStrip}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{products?.length || 0}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={[styles.statValue, { color: '#B45309' }]}>{lowStockCount}</Text>
            <Text style={styles.statLabel}>Low Stock</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={[styles.statValue, { color: '#B91C1C' }]}>{products?.filter((p: any) => p.quantity === 0).length || 0}</Text>
            <Text style={styles.statLabel}>Out of Stock</Text>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterBar}
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
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 90 }
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#B45309']} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="No products found"
            subtitle="Try adjusting your filters or search query"
          />
        }
      />

      <TouchableOpacity 
        style={[
          styles.fab,
          { bottom: TAB_BAR_HEIGHT + insets.bottom + 16 }
        ]} 
        onPress={() => router.push('/(app)/inventory/add-product')}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgMuted,
    borderRadius: theme.radius.full,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.font.body,
    color: theme.colors.textPrimary,
  },
  statsStrip: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statChip: {
    flex: 1,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.sm,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statValue: {
    fontSize: 16,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  filterBar: {
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
  },
  activeFilterPill: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  inactiveFilterPill: {
    backgroundColor: theme.colors.bgMuted,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
  },
  activeFilterText: {
    color: theme.colors.primary,
  },
  inactiveFilterText: {
    color: theme.colors.textMuted,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.lg,
  },
});

