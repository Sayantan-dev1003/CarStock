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
import { formatDate } from '../../../../src/utils/format';

const FILTERS = ['All', 'Paid', 'Pending'];

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
    queryFn: () => billingApi.getBills(
      1, 
      50, 
      undefined, 
      undefined, 
      selectedFilter === 'All' ? undefined : selectedFilter.toUpperCase()
    ),
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
        title="Billing History"
        subtitle={formatDate(new Date())}
        rightAction={{
          icon: 'add',
          onPress: () => setIsCreating(true),
        }}
      />

      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={[styles.statsIconCircle, { backgroundColor: theme.colors.primaryLight }]}>
            <Ionicons name="receipt" size={20} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.statsValue}>{billsData?.data?.length || 0}</Text>
            <Text style={styles.statsLabel}>Total Invoices</Text>
          </View>
        </View>
        <View style={styles.statsCard}>
          <View style={[styles.statsIconCircle, { backgroundColor: '#D1FAE5' }]}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
          </View>
          <View>
            <Text style={styles.statsValue}>
              {billsData?.data?.filter((b: any) => b.status === 'PAID')?.length || 0}
            </Text>
            <Text style={styles.statsLabel}>Paid Bills</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterSection}>
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
                activeOpacity={0.7}
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
        title="New Invoice" 
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
    <View style={styles.container}>
      {isCreating ? renderCreationStep() : renderHistoryStep()}

      {/* Discount Modal unchanged */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  historyContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
    marginTop: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: theme.colors.bgCard,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  statsIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  statsValue: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  statsLabel: {
    fontSize: 11,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
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
  creationContainer: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    backgroundColor: theme.colors.bg,
  },
  createListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 24,
    padding: 24,
    ...theme.shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  modalBody: {
    gap: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
  },
  discountInput: {
    backgroundColor: theme.colors.bgMuted,
    borderRadius: 16,
    padding: 16,
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
  },
});

