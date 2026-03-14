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
        subtitle="Manage your invoices and payments"
        rightAction={{
          icon: 'add-circle',
          onPress: () => setIsCreating(true),
        }}
      />

      <View style={styles.summaryStrip}>
        <View style={styles.summaryCard}>
          <View style={[styles.dot, { backgroundColor: theme.colors.textPrimary }]} />
          <View>
            <Text style={styles.summaryValue}>{billsData?.data.length || 0}</Text>
            <Text style={styles.summaryLabel}>Total Bills</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
          <View>
            <Text style={styles.summaryValue}>{billsData?.data.filter((b: any) => b.total > 0).length || 0}</Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>
        </View>
        <View style={styles.summaryCard}>
          <View style={[styles.dot, { backgroundColor: theme.colors.warning }]} />
          <View>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>Pending</Text>
          </View>
        </View>
      </View>

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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#B45309']} />
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
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
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
  summaryStrip: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
    marginTop: 8,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.sm,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
  },
  filterBarContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 20,
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
    paddingBottom: 100,
  },
  creationContainer: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    backgroundColor: theme.colors.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  createListContent: {
    padding: 20,
    paddingBottom: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(69, 26, 3, 0.4)', // subtly tinted dark amber overlay
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: 24,
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
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  discountInput: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: 16,
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    marginBottom: 24,
    backgroundColor: theme.colors.bgMuted,
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

