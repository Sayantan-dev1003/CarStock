import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Modal, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { useBillingStore } from '../../../src/store/billing.store';
import { ProductSearchBar } from '../../../src/components/billing/ProductSearchBar';
import { BillLineItem } from '../../../src/components/billing/BillLineItem';
import { BillSummaryBar } from '../../../src/components/billing/BillSummaryBar';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { AppButton } from '../../../src/components/common/AppButton';
import { ProductSearchResult } from '../../../src/types/product.types';

export default function BillingScreen() {
  const router = useRouter();
  const { 
    items, 
    discount, 
    addItem, 
    removeItem, 
    updateQuantity, 
    setDiscount 
  } = useBillingStore();

  const [isDiscountModalVisible, setIsDiscountModalVisible] = useState(false);
  const [tempDiscount, setTempDiscount] = useState(discount.toString());

  const handleProductSelect = (product: ProductSearchResult) => {
    addItem({
      productId: product.id,
      name: product.name,
      unitPrice: product.sellingPrice,
      quantity: 1,
    });
  };

  const handleProceed = () => {
    router.push('/(app)/billing/customer-select');
  };

  const handleApplyDiscount = () => {
    const amount = parseFloat(tempDiscount) || 0;
    setDiscount(amount);
    setIsDiscountModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Product Search Section */}
      <View style={styles.searchSection}>
        <ProductSearchBar onProductSelect={handleProductSelect} />
      </View>

      {/* Bill Items List */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <BillLineItem
            item={item}
            onQuantityChange={updateQuantity}
            onRemove={removeItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="No items added"
            subtitle="Search for products above to start building the bill"
          />
        }
      />

      {/* Fixed Bottom Summary */}
      <BillSummaryBar
        items={items}
        discount={discount}
        onProceed={handleProceed}
        onDiscountPress={() => {
          setTempDiscount(discount.toString());
          setIsDiscountModalVisible(true);
        }}
      />

      {/* Discount Modal */}
      <Modal
        visible={isDiscountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDiscountModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply Discount</Text>
              <TouchableOpacity onPress={() => setIsDiscountModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Discount Amount (₹)</Text>
              <TextInput
                style={styles.discountInput}
                value={tempDiscount}
                onChangeText={setTempDiscount}
                keyboardType="numeric"
                autoFocus
                placeholder="0.00"
              />
              <View style={styles.modalActions}>
                <AppButton
                  title="Cancel"
                  variant="outline"
                  onPress={() => setIsDiscountModalVisible(false)}
                  style={styles.modalBtn}
                />
                <AppButton
                  title="Apply"
                  onPress={handleApplyDiscount}
                  style={styles.modalBtn}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  searchSection: {
    padding: Spacing.base,
    backgroundColor: Colors.white,
    zIndex: 10,
    ...Shadows.sm,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  modalBody: {
    paddingVertical: Spacing.sm,
  },
  modalLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey500,
    marginBottom: Spacing.xs,
  },
  discountInput: {
    borderWidth: 1,
    borderColor: Colors.grey200,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 0.48,
  },
});
