import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Modal, 
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../../../src/constants/theme';
import { useBillingStore } from '../../../../src/store/billing.store';
import { ProductSearchBar } from '../../../../src/components/billing/ProductSearchBar';
import { BillLineItem } from '../../../../src/components/billing/BillLineItem';
import { BillSummaryBar } from '../../../../src/components/billing/BillSummaryBar';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { AppButton } from '../../../../src/components/common/AppButton';
import { ProductSearchResult } from '../../../../src/types/product.types';
import { useQuery } from '@tanstack/react-query';
import { billingApi } from '../../../../src/api/billing.api';
import { BillCard } from '../../../../src/components/billing/BillCard';
import { AppHeader } from '../../../../src/components/common/AppHeader';

const FILTERS = ['All', 'Paid', 'Pending', 'Overdue'];

export default function BillingScreen() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All');
  
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

  // Fetch Bills for the History List
  const { 
    data: billsData, 
    isLoading, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['bills', selectedFilter],
    queryFn: () => billingApi.getBills(1, 20),
  });

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

  const renderHistoryStep = () => (
    <View style={styles.historyContainer}>
      <AppHeader 
        title="Billing"
        rightAction={{
          icon: 'add',
          onPress: () => setIsCreating(true),
        }}
      />

      <View style={styles.filterBarContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isActive ? styles.activeFilterPill : styles.inactiveFilterPill
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[
                  styles.filterText,
                  isActive ? styles.activeFilterText : styles.inactiveFilterText
                ]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={billsData?.data || []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BillCard
            bill={item}
            onPress={(bill) => router.push(`/(app)/billing/${bill.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[theme.colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="No bills found"
            subtitle="Start by creating a new bill for a customer"
          />
        }
      />
    </View>
  );

  const renderCreationStep = () => (
    <View style={styles.creationContainer}>
      <AppHeader 
        title="Create New Bill" 
        showBackButton 
        onBackPress={() => setIsCreating(false)} 
      />

      <View style={styles.searchSection}>
        <ProductSearchBar onProductSelect={handleProductSelect} />
      </View>

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
        contentContainerStyle={styles.createListContent}
        ListEmptyComponent={
          <EmptyState
            icon="cart-outline"
            title="No items added"
            subtitle="Search for products above to start building the bill"
          />
        }
      />

      <BillSummaryBar
        items={items}
        discount={discount}
        onProceed={handleProceed}
        onDiscountPress={() => {
          setTempDiscount(discount.toString());
          setIsDiscountModalVisible(true);
        }}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {isCreating ? renderCreationStep() : renderHistoryStep()}

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
                <Ionicons name="close" size={24} color={theme.colors.textPrimary} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  historyContainer: {
    flex: 1,
  },
  filterBarContainer: {
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xs,
  },
  filterContent: {
    paddingHorizontal: 20,
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  creationContainer: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    backgroundColor: theme.colors.bgCard,
    zIndex: 10,
    ...theme.shadow.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  createListContent: {
    padding: 20,
    paddingBottom: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 25, 23, 0.4)', // Warm overlay
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    padding: 24,
    ...theme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  modalBody: {
    paddingVertical: 5,
  },
  modalLabel: {
    fontSize: 12,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  discountInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    marginBottom: 24,
    backgroundColor: theme.colors.bg,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 0.48,
  },
});

