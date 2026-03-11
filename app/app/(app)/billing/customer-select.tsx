import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { AppInput } from '../../../src/components/common/AppInput';
import { AppButton } from '../../../src/components/common/AppButton';
import { AppCard } from '../../../src/components/common/AppCard';
import { StatusBadge } from '../../../src/components/common/StatusBadge';
import { VehicleCard } from '../../../src/components/customers/VehicleCard';
import { customersApi } from '../../../src/api/customers.api';
import { vehiclesApi } from '../../../src/api/vehicles.api';
import { useBillingStore } from '../../../src/store/billing.store';
import { Customer, Vehicle } from '../../../src/types/customer.types';

export default function CustomerSelectScreen() {
    const router = useRouter();
    const { setCustomer, setVehicle } = useBillingStore();

    const [mobile, setMobile] = useState('');
    const [lookupLoading, setLookupLoading] = useState(false);
    const [foundCustomer, setFoundCustomer] = useState<(Customer & { vehicles: Vehicle[] }) | null>(null);
    const [showNewForm, setShowNewForm] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset: resetForm,
    } = useForm({
        defaultValues: {
            name: '',
            email: '',
        },
    });

    useEffect(() => {
        if (mobile.length === 10) {
            handleLookup();
        } else {
            setFoundCustomer(null);
            setShowNewForm(false);
        }
    }, [mobile]);

    const handleLookup = async () => {
        setLookupLoading(true);
        try {
            const result = await customersApi.lookupByMobile(mobile);
            if (result.found && result.customer) {
                // The API type says Customer & { vehicles: Vehicle[] } but MobileLookupResult might be different
                // Let's fetch full details to be sure
                const fullCustomer = await customersApi.getCustomer(result.customer.id);
                setFoundCustomer(fullCustomer);
                setShowNewForm(false);
            } else {
                setFoundCustomer(null);
                setShowNewForm(true);
            }
        } catch (error) {
            console.error('Customer lookup error:', error);
        } finally {
            setLookupLoading(false);
        }
    };

    const onCreateCustomer = async (data: any) => {
        try {
            const customer = await customersApi.createCustomer({
                ...data,
                mobile,
            });
            // New customers won't have vehicles yet
            setFoundCustomer({ ...customer, vehicles: [], bills: [] });
            setShowNewForm(false);
        } catch (error) {
            console.error('Create customer error:', error);
        }
    };

    const handleContinue = () => {
        if (foundCustomer) {
            setCustomer(foundCustomer.id, foundCustomer.name);
            setVehicle(selectedVehicleId);
            router.push('/(app)/billing/payment');
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.section}>
                <AppInput
                    label="Customer Mobile Number"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    maxLength={10}
                    leftIcon="phone"
                    rightIcon={lookupLoading ? 'loading' : undefined}
                />
            </View>

            {foundCustomer && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Customer Found</Text>
                    <AppCard style={styles.profileCard}>
                        <View style={styles.profileHeader}>
                            <View>
                                <Text style={styles.customerName}>{foundCustomer.name}</Text>
                                <Text style={styles.customerMobile}>{foundCustomer.mobile}</Text>
                            </View>
                            <StatusBadge status={foundCustomer.tag} text={foundCustomer.tag} />
                        </View>
                        <View style={styles.statsRow}>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Lifetime Spend</Text>
                                <Text style={styles.statValue}>₹{foundCustomer.totalSpend.toLocaleString()}</Text>
                            </View>
                            <View style={styles.stat}>
                                <Text style={styles.statLabel}>Previous Bills</Text>
                                <Text style={styles.statValue}>{foundCustomer.billCount}</Text>
                            </View>
                        </View>
                    </AppCard>

                    <Text style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
                        Select Vehicle (Optional)
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
                        <TouchableOpacity
                            style={[
                                styles.skipVehicle,
                                selectedVehicleId === null && styles.selectedSkip,
                            ]}
                            onPress={() => setSelectedVehicleId(null)}
                        >
                            <MaterialCommunityIcons
                                name="car-off"
                                size={24}
                                color={selectedVehicleId === null ? Colors.primary : Colors.grey400}
                            />
                            <Text style={[
                                styles.skipText,
                                selectedVehicleId === null && styles.selectedSkipText
                            ]}>Skip Vehicle</Text>
                        </TouchableOpacity>
                        {foundCustomer.vehicles.map((v) => (
                            <VehicleCard
                                key={v.id}
                                vehicle={v}
                                selected={selectedVehicleId === v.id}
                                onPress={() => setSelectedVehicleId(v.id)}
                            />
                        ))}
                    </ScrollView>

                    <AppButton
                        title="Continue with this Customer"
                        onPress={handleContinue}
                        style={styles.continueBtn}
                        fullWidth
                    />
                </View>
            )}

            {showNewForm && (
                <View style={styles.section}>
                    <View style={styles.newHeader}>
                        <MaterialCommunityIcons name="account-plus" size={24} color={Colors.primary} />
                        <View style={{ marginLeft: Spacing.sm }}>
                            <Text style={styles.newTitle}>New Customer</Text>
                            <Text style={styles.newSubtitle}>No profile found. Create one to continue.</Text>
                        </View>
                    </View>

                    <Controller
                        control={control}
                        name="name"
                        rules={{ required: 'Name is required' }}
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="Full Name"
                                placeholder="Ravi Kumar"
                                value={value}
                                onChangeText={onChange}
                                error={errors.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="Email Address"
                                placeholder="ravi@example.com"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        )}
                    />

                    <AppButton
                        title="Create & Continue"
                        onPress={handleSubmit(onCreateCustomer)}
                        style={styles.continueBtn}
                        fullWidth
                    />
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.fontSizes.md,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.md,
    },
    profileCard: {
        padding: Spacing.md,
    },
    profileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    customerName: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    customerMobile: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey500,
    },
    statsRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: Colors.grey100,
        paddingTop: Spacing.md,
    },
    stat: {
        flex: 1,
    },
    statLabel: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey400,
        marginBottom: 2,
    },
    statValue: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    vehicleScroll: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
    },
    skipVehicle: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey200,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    selectedSkip: {
        borderColor: Colors.primary,
        backgroundColor: '#FFF1F2',
    },
    skipText: {
        fontSize: 10,
        color: Colors.grey500,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    selectedSkipText: {
        color: Colors.primary,
        fontWeight: Typography.fontWeights.bold,
    },
    continueBtn: {
        marginTop: Spacing.md,
    },
    newHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: '#FFF1F2',
        borderRadius: BorderRadius.md,
    },
    newTitle: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.primary,
    },
    newSubtitle: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey600,
    },
});
