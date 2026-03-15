import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { AppInput } from '../common/AppInput';
import { useTheme } from '../../context/ThemeContext';
import { productsApi } from '../../api/products.api';
import { useDebounce } from '../../hooks/useDebounce';
import { ProductSearchResult } from '../../types/product.types';
import { formatCurrency } from '../../utils/format';

interface ProductSearchBarProps {
  onProductSelect: (product: ProductSearchResult) => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ onProductSelect }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debouncedQuery = useDebounce(query, 300);

  const { data: results, isLoading } = useQuery({
    queryKey: ['product-search', debouncedQuery],
    queryFn: () => productsApi.searchProducts(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
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
        leftIcon="search-outline"
        onFocus={() => setIsFocused(true)}
        containerStyle={styles.inputContainer}
      />

      {isFocused && query.length >= 1 && (
        <View style={styles.dropdown}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Quick Search Results</Text>
            <TouchableOpacity onPress={() => setIsFocused(false)}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
          {isLoading ? (
            <View style={styles.centerItem}>
              <ActivityIndicator color={theme.colors.primary} />
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
                  <View style={styles.resultIcon}>
                    <MaterialCommunityIcons name="package-variant-closed" size={20} color={theme.colors.primary} />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{item.name}</Text>
                    <Text style={styles.resultStock}>Stock: {item.quantity} available</Text>
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

function createStyles(theme: any) {
  return StyleSheet.create({
  container: {
    zIndex: 1000,
    width: '100%',
  },
  inputContainer: {
    marginBottom: 0,
  },
  dropdown: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.bgCard,
    borderRadius: 24,
    maxHeight: 350,
    ...theme.shadow.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dropdownTitle: {
    fontSize: 12,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    padding: 8,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 4,
  },
  resultIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
  },
  resultName: {
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  resultStock: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  resultPrice: {
    fontSize: 16,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  centerItem: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResults: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});

}
