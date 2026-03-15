import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../../src/constants/theme';
import { billingApi } from '../../../src/api/billing.api';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { formatCurrency, formatDateTime, formatBillNumber } from '../../../src/utils/format';
import { AppButton } from '../../../src/components/common/AppButton';
import { AppHeader } from '../../../src/components/common/AppHeader';

export default function BillDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isResending, setIsResending] = useState(false);

  const { data: bill, isLoading, error, refetch } = useQuery({
    queryKey: ['bill', id],
    queryFn: () => billingApi.getBill(id as string),
    enabled: !!id,
  });

  const handleResend = async () => {
    if (!bill) return;
    setIsResending(true);
    try {
      await billingApi.resendBill(bill.id);
      alert('Receipt resent successfully!');
      refetch();
    } catch (error) {
      console.error('Resend error:', error);
      alert('Failed to resend receipt.');
    } finally {
      setIsResending(false);
    }
  };

  const handleViewPdf = () => {
    if (bill?.pdfUrl) {
      Linking.openURL(bill.pdfUrl);
    } else {
      alert('PDF not available.');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  
  if (error || !bill) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Bill Details" showBackButton />
        <View style={styles.center}>
          <Text style={styles.errorText}>Bill not found or failed to load.</Text>
          <AppButton title="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const customerName = bill.customer?.name || (bill as any).customerName || 'Walk-in Customer';
  const isWalkIn = !bill.customer?.name && !(bill as any).customerName;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return theme.colors.success;
      case 'PROCESSING': return theme.colors.warning;
      case 'FAILED': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Invoice Details" showBackButton />
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} bounces={false}>
        
        {/* Header Summary */}
        <View style={styles.header}>
          <View style={styles.customerRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
              {!isWalkIn && customerName !== 'Walk-in Customer' ? (
                <Text style={styles.avatarText}>{customerName.charAt(0).toUpperCase()}</Text>
              ) : (
                <Ionicons name="person" size={24} color={theme.colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.customerName}>{customerName}</Text>
              {bill.customer?.mobile && <Text style={styles.customerSub}>{bill.customer.mobile}</Text>}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(bill.status) + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(bill.status) }]} />
              <Text style={[styles.statusText, { color: getStatusColor(bill.status) }]}>{bill.status}</Text>
            </View>
          </View>

          <View style={styles.pricingCard}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Total Amount</Text>
              <Text style={styles.priceValue}>{formatCurrency(bill.total)}</Text>
            </View>
            <View style={styles.vDivider} />
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Payment Mode</Text>
              <Text style={styles.priceValue}>{bill.paymentMode}</Text>
            </View>
          </View>
        </View>

        {/* Invoice Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Invoice Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Invoice Number</Text>
              <Text style={styles.infoValue}>{formatBillNumber(bill.billNumber)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date & Time</Text>
              <Text style={styles.infoValue}>{formatDateTime(bill.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items ({bill.items?.length || 0})</Text>
          <View style={styles.itemsCard}>
            {bill.items?.map((item: any) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.product?.name || 'Unknown Product'}</Text>
                  <Text style={styles.itemQty}>{item.quantity} x {formatCurrency(item.unitPrice)}</Text>
                </View>
                <Text style={styles.itemTotal}>{formatCurrency(item.total)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Summary Footer */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(bill.subtotal || 0)}</Text>
            </View>
            {bill.discount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.success }]}>-{formatCurrency(bill.discount)}</Text>
              </View>
            )}
            {(bill.cgst > 0) && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>CGST</Text>
                <Text style={styles.summaryValue}>+{formatCurrency(bill.cgst)}</Text>
              </View>
            )}
            {(bill.sgst > 0) && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>SGST</Text>
                <Text style={styles.summaryValue}>+{formatCurrency(bill.sgst)}</Text>
              </View>
            )}
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(bill.total)}</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <AppButton
            title="View PDF"
            onPress={handleViewPdf}
            leftIcon="document-text-outline"
            style={styles.actionBtn}
          />
          <AppButton
            title={isResending ? "Resending..." : "Resend Receipt"}
            onPress={handleResend}
            variant="outline"
            leftIcon="send-outline"
            style={[styles.actionBtn, { marginTop: 12 }]}
            disabled={isResending}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    fontFamily: theme.font.body,
    color: theme.colors.error,
  },
  header: {
    backgroundColor: theme.colors.bgCard,
    padding: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...theme.shadow.card,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  customerName: {
    fontSize: 18,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  customerSub: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontFamily: theme.font.bodyBold,
    textTransform: 'uppercase',
  },
  pricingCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.textPrimary,
    borderRadius: 24,
    padding: 20,
    ...theme.shadow.lg,
  },
  priceItem: {
    flex: 1,
    alignItems: 'center',
  },
  vDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  priceLabel: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  priceValue: {
    fontSize: 22,
    fontFamily: theme.font.heading,
    color: '#fff',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: theme.colors.bgCard,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  itemsCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.bg,
  },
  itemName: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textPrimary,
  },
  itemQty: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: theme.colors.bgCard,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  actions: {
    paddingHorizontal: 24,
    marginTop: 40,
  },
  actionBtn: {
    width: '100%',
  },
});
