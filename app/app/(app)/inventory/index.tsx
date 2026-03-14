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
import { theme } from '../../../src/constants/theme';
import { productsApi } from '../../../src/api/products.api';
import { ProductCard } from '../../../src/components/inventory/ProductCard';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { ProductCategory } from '../../../src/types/product.types';

const CATEGORIES: (ProductCategory | 'ALL' | 'LOW_STOCK')[] = [
  'ALL', 'LOW_STOCK', 'TYRES', 'BATTERIES', 'WIPERS', 'BRAKES', 'SEAT_COVERS', 'LIGHTING', 'AUDIO', 'OILS', 'ELECTRICAL', 'OTHER'
];

import { AppHeader } from '../../../src/components/common/AppHeader';

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
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Inventory" />
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

      {lowStockCount > 0 && (
        <View style={styles.lowStockBanner}>
          <Ionicons name="warning-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.lowStockText}>
            You have {lowStockCount} items with low stock level.
          </Text>
        </View>
      )}

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
          { paddingBottom: TAB_BAR_HEIGHT + insets.bottom + 80 }
        ]}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
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
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 20,
    paddingTop: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    paddingHorizontal: 16,
    height: 52,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
  filterBar: {
    marginBottom: theme.spacing.md,
  },
  filterContent: {
    paddingRight: 20,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.sm,
    marginRight: 8,
  },
  activeFilterPill: {
    backgroundColor: theme.colors.primary,
  },
  inactiveFilterPill: {
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterText: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
  },
  activeFilterText: {
    color: theme.colors.bgCard,
  },
  inactiveFilterText: {
    color: theme.colors.textSecondary,
  },
  lowStockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.1)',
  },
  lowStockText: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.primary,
    marginLeft: 8,
  },
  listContent: {
    paddingHorizontal: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.lg,
    elevation: 8,
  },
});
