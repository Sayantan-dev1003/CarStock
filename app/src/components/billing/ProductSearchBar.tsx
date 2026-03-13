import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppInput } from '../common/AppInput';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { productsApi } from '../../api/products.api';
import { useDebounce } from '../../hooks/useDebounce';
import { ProductSearchResult } from '../../types/product.types';
import { formatCurrency } from '../../utils/format';

interface ProductSearchBarProps {
  onProductSelect: (product: ProductSearchResult) => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ onProductSelect }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading } = useQuery({
    queryKey: ['product-search', debouncedQuery],
    queryFn: () => productsApi.searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  });

  const handleSelect = (product: ProductSearchResult) => {
    onProductSelect(product);
    setQuery('');
    setIsFocused(false);
  };

  return (
    <View style={styles.container}>
      <AppInput
        placeholder="Search products to add..."
        value={query}
        onChangeText={setQuery}
        leftIcon="magnify"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        containerStyle={styles.inputContainer}
      />

      {isFocused && query.length >= 2 && (
        <View style={styles.dropdown}>
          {isLoading ? (
            <View style={styles.centerItem}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : results && results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.resultItem}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultStock}>In Stock: {item.quantity}</Text>
                  </View>
                  <Text style={styles.resultPrice}>{formatCurrency(item.sellingPrice)}</Text>
                </TouchableOpacity>
              )}
              keyboardShouldPersistTaps="handled"
              style={styles.list}
            />
          ) : (
            <View style={styles.centerItem}>
              <Text style={styles.noResults}>No products found for "{query}"</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    maxHeight: 300,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  list: {
    padding: Spacing.xs,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  resultStock: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  resultPrice: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  centerItem: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey500,
  },
});
