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
import { useTheme } from '../../../src/context/ThemeContext';
import { productsApi } from '../../../src/api/products.api';
import { inventoryApi } from '../../../src/api/inventory.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { StockBadge } from '../../../src/components/inventory/StockBadge';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { AppButton } from '../../../src/components/common/AppButton';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { StockLog } from '../../../src/types/product.types';

export default function ProductDetailScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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
      <AppHeader title="Product Details" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.skuText}>{product.sku}</Text>
              <Text style={styles.nameText}>{product.name}</Text>
            </View>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.7}>
              <MaterialCommunityIcons name="share-variant-outline" size={20} color={theme.colors.primary} />
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
          <Text style={styles.sectionTitle}>Product Information</Text>
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
            <Text style={styles.sectionTitle}>Stock Movement</Text>
            <MaterialCommunityIcons name="history" size={18} color={theme.colors.textMuted} />
          </View>

          {isHistoryLoading ? (
            <ActivityIndicator color={theme.colors.primary} style={{ margin: 40 }} />
          ) : history?.data && history.data.length > 0 ? (
            <View style={styles.historyContainer}>
              {history.data.map((log: StockLog) => (
                <View key={log.id} style={styles.historyRow}>
                  <View style={[
                    styles.logIcon,
                    { backgroundColor: log.type === 'ADD' ? theme.colors.success + '15' : theme.colors.error + '15' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={log.type === 'ADD' ? 'plus' : 'cart-outline'} 
                      size={18} 
                      color={log.type === 'ADD' ? theme.colors.success : theme.colors.error} 
                    />
                  </View>
                  <View style={styles.logInfo}>
                    <View style={styles.logTop}>
                      <Text style={styles.logTitle}>
                        {log.type === 'ADD' ? 'Stock Added' : 'Stock Sold'}
                      </Text>
                      <Text style={[
                        styles.logQty,
                        { color: log.type === 'ADD' ? theme.colors.success : theme.colors.error }
                      ]}>
                        {log.type === 'ADD' ? '+' : '-'}{log.quantity}
                      </Text>
                    </View>
                    <View style={styles.logBottom}>
                      <Text style={styles.logNote} numberOfLines={1}>{log.note || (log.type === 'ADD' ? 'Manual inventory update' : 'Sold via bill')}</Text>
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
            title="Edit Product Details"
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

function createStyles(theme: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: theme.colors.bgCard,
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadow.card,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  skuText: {
    fontSize: 12,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nameText: {
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
    marginTop: 4,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  categoryBadge: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginLeft: 12,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pricingCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: 20,
    ...theme.shadow.lg,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: 'rgba(0,0,0,0.6)',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: '#1A1817',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  detailsGrid: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgCard,
    padding: 20,
    borderRadius: theme.radius.lg,
    ...theme.shadow.sm,
  },
  detailBox: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  descriptionBox: {
    marginTop: 16,
    backgroundColor: theme.colors.bgCard,
    padding: 20,
    borderRadius: theme.radius.lg,
    ...theme.shadow.sm,
  },
  descriptionText: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
  historyContainer: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadow.sm,
  },
  historyRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.bgMuted,
  },
  logIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logInfo: {
    flex: 1,
    marginLeft: 16,
  },
  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logTitle: {
    fontSize: 14,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  logQty: {
    fontSize: 14,
    fontFamily: theme.font.bodyBold,
  },
  logBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    alignItems: 'center',
  },
  logNote: {
    fontSize: 11,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    flex: 1,
    marginRight: 12,
  },
  logDate: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
  },
  emptyLogs: {
    backgroundColor: theme.colors.bgCard,
    padding: 32,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  emptyLogsText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontFamily: theme.font.body,
  },
  bottomButtons: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  editBtn: {
    marginBottom: 16,
  },
});
}
