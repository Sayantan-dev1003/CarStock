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
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
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
              onPress={() => router.replace('/(app)/billing')}
              style={styles.flexBtn}
              leftIcon="plus"
            />
          </View>
          <AppButton
            title="Back to Dashboard"
            onPress={() => router.replace('/(app)/dashboard')}
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
    backgroundColor: Colors.screenBg,
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    backgroundColor: Colors.dark,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.lg,
  },
  successTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.white,
    marginBottom: 4,
  },
  billId: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey400,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.lg,
    marginTop: -40,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  summaryLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey500,
  },
  summaryValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  amountValue: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  modeBadge: {
    backgroundColor: Colors.grey100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  modeText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.grey100,
    marginVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginBottom: Spacing.lg,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey600,
    marginLeft: Spacing.sm,
  },
  statusBadgeSuccess: {
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusTextSuccess: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.success,
  },
  retryBtn: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  pdfButtonText: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.dark,
  },
  bottomActions: {
    padding: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  btnRow: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  flexBtn: {
    flex: 1,
  },
  dashboardBtn: {
    borderColor: Colors.grey300,
  },
});
