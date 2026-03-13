import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Share,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { productsApi } from '../../../src/api/products.api';
import { inventoryApi } from '../../../src/api/inventory.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { StockBadge } from '../../../src/components/inventory/StockBadge';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { AppButton } from '../../../src/components/common/AppButton';
import { StockLog } from '../../../src/types/product.types';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [historyPage, setHistoryPage] = useState(1);

  const { data: product, isLoading: isProductLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id as string),
  });

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['stock-history', id, historyPage],
    queryFn: () => inventoryApi.getStockHistory(id as string, historyPage, 10),
  });

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Product SKU: ${product.sku}\nName: ${product.name}\nPrice: ${formatCurrency(product.sellingPrice)}`,
        title: 'Share Product Information',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (isProductLoading) return <LoadingSpinner />;
  if (!product) return <View style={styles.container}><Text>Product not found</Text></View>;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.skuText}>{product.sku}</Text>
              <Text style={styles.nameText}>{product.name}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant-outline" size={22} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.metaRow}>
            <StockBadge quantity={product.quantity} reorderLevel={product.reorderLevel} />
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category.replace(/_/g, ' ')}</Text>
            </View>
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Selling Price</Text>
              <Text style={styles.priceValue}>{formatCurrency(product.sellingPrice)}</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Inventory</Text>
              <Text style={styles.priceValue}>{product.quantity} Units</Text>
            </View>
          </View>
        </View>

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Details</Text>
          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Brand</Text>
              <Text style={styles.detailValue}>{product.brand || '---'}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Reorder Level</Text>
              <Text style={styles.detailValue}>{product.reorderLevel} Units</Text>
            </View>
          </View>
          {product.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </View>
          )}
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Stock Movement History</Text>
            <MaterialCommunityIcons name="history" size={20} color={Colors.grey400} />
          </View>

          {isHistoryLoading ? (
            <ActivityIndicator color={Colors.primary} style={{ margin: Spacing.xl }} />
          ) : history?.data && history.data.length > 0 ? (
            <View style={styles.historyContainer}>
              {history.data.map((log: StockLog) => (
                <View key={log.id} style={styles.historyRow}>
                  <View style={[
                    styles.logIcon,
                    { backgroundColor: log.type === 'ADDITION' ? Colors.successLight : Colors.errorLight }
                  ]}>
                    <MaterialCommunityIcons 
                      name={log.type === 'ADDITION' ? 'plus' : 'cart-outline'} 
                      size={18} 
                      color={log.type === 'ADDITION' ? Colors.success : Colors.error} 
                    />
                  </View>
                  <View style={styles.logInfo}>
                    <View style={styles.logTop}>
                      <Text style={styles.logTitle}>
                        {log.type === 'ADDITION' ? 'Stock Added' : 'Stock Sold'}
                      </Text>
                      <Text style={[
                        styles.logQty,
                        { color: log.type === 'ADDITION' ? Colors.success : Colors.error }
                      ]}>
                        {log.type === 'ADDITION' ? '+' : '-'}{log.quantity}
                      </Text>
                    </View>
                    <View style={styles.logBottom}>
                      <Text style={styles.logNote}>{log.note || (log.type === 'ADDITION' ? 'Manual inventory update' : 'Sold via bill')}</Text>
                      <Text style={styles.logDate}>{formatDate(log.createdAt)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyLogs}>
              <Text style={styles.emptyLogsText}>No stock history recorded</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomButtons}>
          <AppButton
            title="Edit Product"
            onPress={() => router.push({
              pathname: '/(app)/inventory/add-product',
              params: { id: product.id }
            })}
            variant="outline"
            leftIcon="pencil-outline"
            style={styles.editBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xxl,
  },
  header: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...Shadows.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  skuText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginTop: 2,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  categoryBadge: {
    backgroundColor: Colors.grey100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: Spacing.sm,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.grey600,
    textTransform: 'uppercase',
  },
  pricingCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: '#3F3F5F',
  },
  priceLabel: {
    fontSize: 10,
    color: Colors.grey400,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.white,
  },
  section: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginBottom: Spacing.sm,
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.dark,
  },
  descriptionBox: {
    marginTop: Spacing.md,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  descriptionText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey600,
    lineHeight: 20,
  },
  historyContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  historyRow: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitle: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  logQty: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
  },
  logBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  logNote: {
    fontSize: 10,
    color: Colors.grey500,
    flex: 1,
    marginRight: Spacing.md,
  },
  logDate: {
    fontSize: 10,
    color: Colors.grey400,
  },
  emptyLogs: {
    backgroundColor: Colors.white,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  emptyLogsText: {
    color: Colors.grey400,
    fontSize: Typography.fontSizes.sm,
  },
  bottomButtons: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xxl,
  },
  editBtn: {
    marginBottom: Spacing.md,
  },
});
