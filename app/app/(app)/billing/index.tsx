import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Spacing } from '../../../src/constants/theme';
import { useBillingStore } from '../../../src/store/billing.store';
import { ProductSearchBar } from '../../../src/components/billing/ProductSearchBar';
import { BillLineItem } from '../../../src/components/billing/BillLineItem';
import { BillSummaryBar } from '../../../src/components/billing/BillSummaryBar';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { ProductSearchResult } from '../../../src/types/product.types';

export default function BillingScreen() {
    const router = useRouter();
    const { items, addItem, removeItem, updateQuantity } = useBillingStore();

    const handleProductSelect = (product: ProductSearchResult) => {
        addItem({
            productId: product.id,
            productName: product.name,
            unitPrice: product.sellingPrice,
            quantity: 1,
        });
    };

    const handleRemoveItem = (productId: string) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from the bill?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => removeItem(productId),
                },
            ]
        );
    };

    const handleProceed = () => {
        router.push('/(app)/billing/customer-select');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        >
            <View style={styles.header}>
                <ProductSearchBar onProductSelect={handleProductSelect} />
            </View>

            <FlatList
                data={items}
                keyExtractor={(item) => item.productId}
                renderItem={({ item }) => (
                    <BillLineItem
                        item={item}
                        onQuantityChange={(qty) => updateQuantity(item.productId, qty)}
                        onRemove={() => handleRemoveItem(item.productId)}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <EmptyState
                        icon="cart-outline"
                        title="No items added"
                        subtitle="Search for products above to start billing"
                    />
                }
            />

            <BillSummaryBar onProceed={handleProceed} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    header: {
        padding: Spacing.md,
        backgroundColor: Colors.white,
        zIndex: 100,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: Spacing.xl,
    },
});
