import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withDelay,
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
        clearBill();

        scale.value = withSpring(1, { damping: 12 });
        opacity.value = withDelay(300, withSpring(1));
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
            // Updating local state to reflect success
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

    const handleViewBill = async () => {
        if (billData?.pdfUrl) {
            Linking.openURL(billData.pdfUrl);
        }
    };

    if (!billData) return null;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
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
                    <Text style={styles.summaryValue}>{billData.customer?.name || 'Customer'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(billData.total)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Payment Mode</Text>
                    <View style={styles.modeBadge}>
                        <Text style={styles.modeBadgeText}>{billData.paymentMode}</Text>
                    </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.sectionTitle}>Receipt Delivery</Text>

                <View style={styles.deliveryRow}>
                    <View style={styles.deliveryInfo}>
                        <MaterialCommunityIcons name="email-outline" size={20} color={Colors.grey500} />
                        <Text style={styles.deliveryText} numberOfLines={1}>
                            {billData.customer?.email || 'Email not provided'}
                        </Text>
                    </View>
                    {billData.emailSent ? (
                        <View style={styles.statusBadgeSuccess}>
                            <Text style={styles.statusTextSuccess}>Sent</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => handleRetry('email')} disabled={!!retrying}>
                            <Text style={styles.retryBtn}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.deliveryRow}>
                    <View style={styles.deliveryInfo}>
                        <MaterialCommunityIcons name="whatsapp" size={20} color={Colors.grey500} />
                        <Text style={styles.deliveryText} numberOfLines={1}>
                            {billData.customer?.mobile || 'Mobile not provided'}
                        </Text>
                    </View>
                    {billData.whatsappSent ? (
                        <View style={styles.statusBadgeSuccess}>
                            <Text style={styles.statusTextSuccess}>Sent</Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={() => handleRetry('whatsapp')} disabled={!!retrying}>
                            <Text style={styles.retryBtn}>Retry</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </Animated.View>

            <View style={styles.footer}>
                <View style={styles.buttonRow}>
                    <AppButton
                        title="View Bill"
                        onPress={handleViewBill}
                        variant="outline"
                        style={styles.flexBtn}
                        icon="file-pdf-box"
                    />
                    <View style={{ width: Spacing.md }} />
                    <AppButton
                        title="New Bill"
                        onPress={() => router.replace('/(app)/billing')}
                        style={styles.flexBtn}
                        icon="plus"
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
        height: 300,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
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
    modeBadge: {
        backgroundColor: Colors.grey100,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
    },
    modeBadgeText: {
        fontSize: Typography.fontSizes.xs,
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
        marginBottom: Spacing.md,
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
        flex: 1,
        marginRight: Spacing.md,
    },
    deliveryText: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey600,
        marginLeft: Spacing.sm,
        flex: 1,
    },
    statusBadgeSuccess: {
        backgroundColor: Colors.successLight,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.sm,
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
    footer: {
        padding: Spacing.xl,
        paddingTop: Spacing.xxl,
    },
    buttonRow: {
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
