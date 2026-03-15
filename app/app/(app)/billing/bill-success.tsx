import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ScrollView,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { theme } from '../../../src/constants/theme';
import { AppHeader } from '../../../src/components/common/AppHeader';
import { AppButton } from '../../../src/components/common/AppButton';
import { useBillingStore } from '../../../src/store/billing.store';
import { formatCurrency, formatBillNumber } from '../../../src/utils/format';
import { billingApi } from '../../../src/api/billing.api';

export default function BillSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const clearBill = useBillingStore((state) => state.clearBill);

  const [billData, setBillData] = useState<any>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (params.bill) {
      setBillData(JSON.parse(params.bill as string));
    }
    // Clear bill store on mount as per requirement
    clearBill();

    // Animated checkmark: scale from 0 to 1.2 then settle at 1
    scale.value = withSequence(
      withTiming(1.2, { duration: 400 }),
      withSpring(1, { damping: 12 })
    );
    opacity.value = withDelay(300, withTiming(1, { duration: 500 }));
  }, []);

  const animatedCheckStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleRetry = async (type: 'email' | 'whatsapp') => {
    if (!billData) return;
    setRetrying(type);
    try {
      await billingApi.resendBill(billData.id);
      setBillData((prev: any) => ({
        ...prev,
        [type === 'email' ? 'emailSent' : 'whatsappSent']: true,
      }));
    } catch (error) {
      console.error('Retry error:', error);
    } finally {
      setRetrying(null);
    }
  };

  const handleViewPdf = () => {
    if (billData?.pdfUrl) {
      Linking.openURL(billData.pdfUrl);
    }
  };

  if (!billData) return null;

  return (
    <View style={styles.container}>
      <AppHeader title="Success" showBackButton={false} />
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <Animated.View style={[styles.checkCircle, animatedCheckStyle]}>
            <Ionicons name="checkmark" size={48} color={theme.colors.bgCard} />
          </Animated.View>
          <Text style={styles.successTitle}>Payment Confirmed!</Text>
          <Text style={styles.billId}>{formatBillNumber(billData.billNumber)}</Text>
        </View>

        <Animated.View style={[styles.card, animatedContentStyle]}>
          <View style={styles.cardHeader}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={styles.avatarText}>{(billData.customer?.name || billData.customerName || 'C').charAt(0).toUpperCase()}</Text>
            </View>
            <View>
              <Text style={styles.customerName}>{billData.customer?.name || billData.customerName || 'Walk-in Customer'}</Text>
              <Text style={styles.paymentModeText}>{billData.paymentMode} Payment</Text>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountValue}>{formatCurrency(billData.total)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Receipt Delivery</Text>
          
          <View style={styles.deliveryList}>
            <View style={styles.deliveryItem}>
              <View style={styles.deliveryMain}>
                <View style={styles.deliveryIconCircle}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                </View>
                <Text style={styles.deliveryLabel}>Email Receipt</Text>
              </View>
              {billData.emailSent ? (
                 <View style={styles.statusBadgeSuccess}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                    <Text style={styles.statusTextSuccess}>Sent</Text>
                 </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => handleRetry('email')} 
                  disabled={!!retrying}
                  style={styles.retryAction}
                >
                  <Text style={styles.retryBtn}>{retrying === 'email' ? 'Sending...' : 'Retry'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.deliveryItem}>
              <View style={styles.deliveryMain}>
                <View style={styles.deliveryIconCircle}>
                  <Ionicons name="logo-whatsapp" size={20} color={theme.colors.textSecondary} />
                </View>
                <Text style={styles.deliveryLabel}>WhatsApp Receipt</Text>
              </View>
              {billData.whatsappSent ? (
                 <View style={styles.statusBadgeSuccess}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.colors.success} />
                    <Text style={styles.statusTextSuccess}>Sent</Text>
                 </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => handleRetry('whatsapp')} 
                  disabled={!!retrying}
                  style={styles.retryAction}
                >
                  <Text style={styles.retryBtn}>{retrying === 'whatsapp' ? 'Sending...' : 'Retry'}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity style={styles.pdfButton} onPress={handleViewPdf} activeOpacity={0.7}>
            <View style={styles.pdfIconCircle}>
              <Ionicons name="document-text" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.pdfInfo}>
              <Text style={styles.pdfButtonText}>View Digital Invoice</Text>
              <Text style={styles.pdfSubtitle}>PDF • {formatBillNumber(billData.billNumber)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomActions}>
          <AppButton
            title="Create New Bill"
            onPress={() => router.replace('/(app)/(tabs)/billing')}
            size="lg"
            style={styles.actionBtn}
            leftIcon="add-circle-outline"
          />
          <AppButton
            title="Back to Dashboard"
            onPress={() => router.replace('/(app)/(tabs)/dashboard')}
            variant="outline"
            size="lg"
            style={[styles.actionBtn, { marginTop: 12 }]}
            leftIcon="grid-outline"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: theme.colors.textPrimary,
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 30,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    ...theme.shadow.lg,
  },
  successTitle: {
    fontSize: 26,
    fontFamily: theme.font.heading,
    color: theme.colors.bgCard,
    marginBottom: 6,
  },
  billId: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    marginHorizontal: 20,
    marginTop: -50,
    borderRadius: 32,
    padding: 24,
    ...theme.shadow.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.primary,
  },
  customerName: {
    fontSize: 17,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  paymentModeText: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  amountContainer: {
    marginLeft: 'auto',
  },
  amountValue: {
    fontSize: 22,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  deliveryList: {
    gap: 12,
    marginBottom: 24,
  },
  deliveryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deliveryMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deliveryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  deliveryLabel: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textPrimary,
  },
  statusBadgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusTextSuccess: {
    fontSize: 12,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.success,
  },
  retryAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryBtn: {
    fontSize: 13,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.primary,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary + '08',
    padding: 16,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: theme.colors.primary + '20',
    gap: 16,
  },
  pdfIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  pdfInfo: {
    flex: 1,
  },
  pdfButtonText: {
    fontSize: 15,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  pdfSubtitle: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bottomActions: {
    padding: 24,
    paddingTop: 32,
  },
  actionBtn: {
    width: '100%',
  },
});
