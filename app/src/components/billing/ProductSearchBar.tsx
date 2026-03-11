import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { AppInput } from '../common/AppInput';
import { useDebounce } from '../../hooks/useDebounce';
import { productsApi } from '../../api/products.api';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { ProductSearchResult } from '../../types/product.types';
import { StatusBadge } from '../common/StatusBadge';

interface ProductSearchBarProps {
    onProductSelect: (product: ProductSearchResult) => void;
}

export const ProductSearchBar: React.FC<ProductSearchBarProps> = ({ onProductSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebounce(query, 300);

    useEffect(() => {
        const search = async () => {
            if (debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const data = await productsApi.searchProducts(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error('Product search error:', error);
            } finally {
                setLoading(false);
            }
        };

        search();
    }, [debouncedQuery]);

    const handleSelect = (product: ProductSearchResult) => {
        onProductSelect(product);
        setQuery('');
        setResults([]);
    };

    return (
        <View style={styles.container}>
            <AppInput
                label=""
                placeholder="Search products to add..."
                value={query}
                onChangeText={setQuery}
                leftIcon="magnify"
                rightIcon={query.length > 0 ? 'close' : undefined}
                onRightIconPress={() => setQuery('')}
                containerStyle={styles.inputContainer}
            />

            {debouncedQuery.length >= 2 && (
                <View style={styles.dropdown}>
                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator color={Colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.resultItem}
                                    onPress={() => handleSelect(item)}
                                >
                                    <View style={styles.resultLeft}>
                                        <Text style={styles.productName}>{item.name}</Text>
                                        <View style={styles.row}>
                                            <StatusBadge
                                                status={item.category}
                                                text={item.category}
                                                size="sm"
                                            />
                                            <Text style={styles.stockText}>
                                                In stock: {item.quantity}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.priceText}>₹{item.sellingPrice}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={() => (
                                <View style={styles.center}>
                                    <Text style={styles.emptyText}>
                                        No products found for "{debouncedQuery}"
                                    </Text>
                                </View>
                            )}
                            keyboardShouldPersistTaps="handled"
                        />
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 100,
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
        zIndex: 1000,
    },
    resultItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey100,
    },
    resultLeft: {
        flex: 1,
    },
    productName: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.xs,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockText: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
        marginLeft: Spacing.sm,
    },
    priceText: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.primary,
    },
    center: {
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: Colors.grey500,
        textAlign: 'center',
    },
});
