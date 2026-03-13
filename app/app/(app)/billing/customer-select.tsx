import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { AppInput } from '../../../src/components/common/AppInput';
import { AppButton } from '../../../src/components/common/AppButton';
import { AppCard } from '../../../src/components/common/AppCard';
import { VehicleCard } from '../../../src/components/customers/VehicleCard';
import { customersApi } from '../../../src/api/customers.api';
import { useBillingStore } from '../../../src/store/billing.store';
import { Customer, Vehicle } from '../../../src/types/customer.types';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { carDataCache } from '../../../src/utils/carDataCache';

export default function CustomerSelectScreen() {
  const router = useRouter();
  const { setCustomer, setVehicle } = useBillingStore();

  const [mobile, setMobile] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      email: '',
    }
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
    setIsCreating(true);
    try {
      const customer = await customersApi.createCustomer({
        ...data,
        mobile,
      });
      setFoundCustomer({ ...customer, vehicles: [], bills: [] });
      setShowNewForm(false);
    } catch (error) {
      console.error('Create customer error:', error);
    } finally {
      setIsCreating(false);
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
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Mobile Number</Text>
          <AppInput
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon="phone"
            containerStyle={styles.mobileInput}
          />
          {lookupLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          )}
        </View>

        {foundCustomer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Profile</Text>
            <AppCard style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={[styles.avatar, { backgroundColor: Colors.primary + '15' }]}>
                  <Text style={styles.avatarText}>{foundCustomer.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.customerName}>{foundCustomer.name}</Text>
                  <Text style={styles.customerMobile}>{foundCustomer.mobile}</Text>
                  <View style={styles.tagBadge}>
                    <Text style={styles.tagText}>{foundCustomer.tag}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatCurrency(foundCustomer.totalSpend)}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Previous Bills</Text>
                  <Text style={styles.statValue}>{(foundCustomer.bills || []).length}</Text>
                </View>
              </View>
            </AppCard>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>Select Vehicle (Optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vehicleScroll}>
              <TouchableOpacity 
                style={[styles.skipCard, !selectedVehicleId && styles.selectedSkip]}
                onPress={() => setSelectedVehicleId(null)}
              >
                <MaterialCommunityIcons 
                  name="car-off" 
                  size={24} 
                  color={!selectedVehicleId ? Colors.primary : Colors.grey400} 
                />
                <Text style={[styles.skipText, !selectedVehicleId && styles.selectedSkipText]}>Skip Vehicle</Text>
              </TouchableOpacity>
              
              {foundCustomer.vehicles.map((v: any) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  selected={selectedVehicleId === v.id}
                  onPress={() => setSelectedVehicleId(v.id)}
                />
              ))}
            </ScrollView>

            <AppButton
              title="Proceed to Payment"
              onPress={handleContinue}
              size="lg"
              style={styles.continueBtn}
            />
          </View>
        )}

        {showNewForm && (
          <View style={styles.section}>
            <View style={styles.newHeader}>
              <MaterialCommunityIcons name="account-plus-outline" size={24} color={Colors.primary} />
              <View style={styles.newHeaderInfo}>
                <Text style={styles.newTitle}>New Customer</Text>
                <Text style={styles.newSubtitle}>Create a profile to continue</Text>
              </View>
            </View>

            <Controller
              control={control}
              name="name"
              rules={{ required: 'Full name is required' }}
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Full Name"
                  placeholder="Enter name"
                  value={value}
                  onChangeText={onChange}
                  error={errors.name?.message}
                  leftIcon="account-outline"
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
                  message: 'Invalid email address'
                }
              }}
              render={({ field: { onChange, value } }) => (
                <AppInput
                  label="Email Address"
                  placeholder="name@example.com"
                  value={value}
                  onChangeText={onChange}
                  error={errors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="email-outline"
                />
              )}
            />

            <AppButton
              title="Create Customer"
              onPress={handleSubmit(onCreateCustomer)}
              loading={isCreating}
              fullWidth
              style={styles.continueBtn}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  scrollContent: {
    padding: Spacing.base,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginBottom: Spacing.md,
  },
  mobileInput: {
    marginBottom: 0,
  },
  loadingOverlay: {
    position: 'absolute',
    right: 12,
    top: 48,
  },
  profileCard: {
    padding: Spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  customerMobile: {
    fontSize: Typography.fontSizes.base,
    color: Colors.grey500,
    marginTop: 2,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.grey100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.grey600,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.grey100,
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.grey100,
  },
  statLabel: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey400,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  vehicleScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  skipCard: {
    width: 120,
    height: 128,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
    ...Shadows.sm,
  },
  selectedSkip: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF1F2',
  },
  skipText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginTop: 8,
    fontWeight: Typography.fontWeights.medium,
  },
  selectedSkipText: {
    color: Colors.primary,
  },
  continueBtn: {
    marginTop: Spacing.lg,
  },
  newHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#FFF1F2',
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  newHeaderInfo: {
    marginLeft: Spacing.md,
  },
  newTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  newSubtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey600,
    marginTop: 2,
  },
});
