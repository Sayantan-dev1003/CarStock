import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Linking, 
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { theme, Colors } from '../../../src/constants/theme';
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.topSection}>
          <Animated.View style={[styles.checkCircle, animatedCheckStyle]}>
            <MaterialCommunityIcons name="check" size={60} color={Colors.white} />
          </Animated.View>
          <Text style={styles.successTitle}>Payment Confirmed!</Text>
          <Text style={styles.billId}>{formatBillNumber(billData.billNumber)}</Text>
        </View>

        <Animated.View style={[styles.card, animatedContentStyle]}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Customer</Text>
            <Text style={styles.summaryValue}>{billData.customer?.name || 'Walk-in Customer'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount Paid</Text>
            <Text style={styles.amountValue}>{formatCurrency(billData.total)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mode</Text>
            <View style={styles.modeBadge}>
              <Text style={styles.modeText}>{billData.paymentMode}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Receipt Delivery</Text>
          
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryInfo}>
              <MaterialCommunityIcons name="email-check-outline" size={20} color={Colors.grey500} />
              <Text style={styles.deliveryLabel}>Email Receipt</Text>
            </View>
            {billData.emailSent ? (
               <View style={styles.statusBadgeSuccess}>
                  <Text style={styles.statusTextSuccess}>Sent</Text>
               </View>
            ) : (
              <TouchableOpacity onPress={() => handleRetry('email')} disabled={!!retrying}>
                <Text style={styles.retryBtn}>{retrying === 'email' ? 'Sending...' : 'Retry'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.deliveryRow}>
            <View style={styles.deliveryInfo}>
              <MaterialCommunityIcons name="whatsapp" size={20} color={Colors.grey500} />
              <Text style={styles.deliveryLabel}>WhatsApp Receipt</Text>
            </View>
            {billData.whatsappSent ? (
               <View style={styles.statusBadgeSuccess}>
                  <Text style={styles.statusTextSuccess}>Sent</Text>
               </View>
            ) : (
              <TouchableOpacity onPress={() => handleRetry('whatsapp')} disabled={!!retrying}>
                <Text style={styles.retryBtn}>{retrying === 'whatsapp' ? 'Sending...' : 'Retry'}</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity style={styles.pdfButton} onPress={handleViewPdf}>
            <MaterialCommunityIcons name="file-pdf-box" size={24} color={Colors.primary} />
            <Text style={styles.pdfButtonText}>View Bill PDF</Text>
            <MaterialCommunityIcons name="open-in-new" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.bottomActions}>
          <View style={styles.btnRow}>
            <AppButton
              title="New Bill"
              onPress={() => router.replace('/(app)/(tabs)/billing')}
              style={styles.flexBtn}
              leftIcon="add"
            />
          </View>
          <AppButton
            title="Back to Dashboard"
            onPress={() => router.replace('/(app)/(tabs)/dashboard')}
            variant="outline"
            style={styles.dashboardBtn}
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
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: theme.colors.textPrimary,
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadow.lg,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.bgCard,
    marginBottom: 4,
  },
  billId: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: theme.colors.bgCard,
    marginHorizontal: 20,
    marginTop: -60,
    borderRadius: theme.radius.lg,
    padding: 24,
    ...theme.shadow.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  amountValue: {
    fontSize: 20,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  modeBadge: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  modeText: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.bgMuted,
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
    marginBottom: 16,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textSecondary,
    marginLeft: 12,
  },
  statusBadgeSuccess: {
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  statusTextSuccess: {
    fontSize: 11,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.success,
  },
  retryBtn: {
    fontSize: 13,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.primary,
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgMuted,
    padding: 16,
    borderRadius: theme.radius.md,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pdfButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  bottomActions: {
    padding: 24,
    paddingTop: 40,
  },
  btnRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  flexBtn: {
    flex: 1,
  },
  dashboardBtn: {
    marginTop: 8,
  },
});
