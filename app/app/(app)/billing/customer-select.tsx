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
import { useTheme } from '../../../src/context/ThemeContext';
import { AppInput } from '../../../src/components/common/AppInput';
import { AppButton } from '../../../src/components/common/AppButton';
import { AppCard } from '../../../src/components/common/AppCard';
import { VehicleCard } from '../../../src/components/customers/VehicleCard';
import { customersApi } from '../../../src/api/customers.api';
import { useBillingStore } from '../../../src/store/billing.store';
import { Customer, Vehicle } from '../../../src/types/customer.types';
import { formatCurrency, formatDate } from '../../../src/utils/format';
import { AppHeader } from '../../../src/components/common/AppHeader';

export default function CustomerSelectScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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
      <AppHeader title="Select Customer" showBackButton />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mobile Number</Text>
          <AppInput
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
            maxLength={10}
            leftIcon="call-outline"
            containerStyle={styles.mobileInput}
          />
          {lookupLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}
        </View>

        {foundCustomer && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Profile</Text>
            <AppCard style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
                  <Text style={styles.avatarText}>{foundCustomer.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.profileInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.customerName}>{foundCustomer.name}</Text>
                    <View style={styles.tagBadge}>
                      <Text style={styles.tagText}>{foundCustomer.tag}</Text>
                    </View>
                  </View>
                  <Text style={styles.customerMobile}>{foundCustomer.mobile}</Text>
                  {foundCustomer.email && <Text numberOfLines={1} style={styles.customerEmail}>{foundCustomer.email}</Text>}
                </View>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{formatCurrency(foundCustomer.totalSpend)}</Text>
                  <Text style={styles.statLabel}>Total Spend</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{(foundCustomer.bills || []).length}</Text>
                  <Text style={styles.statLabel}>Bills</Text>
                </View>
              </View>
            </AppCard>

            <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Select Vehicle</Text>
            <View style={styles.vehicleList}>
              {foundCustomer.vehicles && foundCustomer.vehicles.length > 0 ? (
                foundCustomer.vehicles.map((v: any) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    selected={selectedVehicleId === v.id}
                    onPress={() => setSelectedVehicleId(v.id)}
                  />
                ))
              ) : (
                <View style={styles.emptyVehicleState}>
                  <MaterialCommunityIcons name="car-info" size={32} color={theme.colors.textMuted} />
                  <Text style={styles.emptyVehicleText}>No vehicles found. Please add a vehicle for this customer first.</Text>
                  <AppButton 
                    title="Add Vehicle" 
                    variant="outline" 
                    size="sm"
                    onPress={() => router.push({ pathname: '/(app)/customers/[id]', params: { id: foundCustomer.id } })}
                    style={{ marginTop: 12 }}
                  />
                </View>
              )}
            </View>

            <AppButton
              title="Proceed to Payment"
              onPress={handleContinue}
              size="lg"
              style={styles.continueBtn}
              rightIcon="arrow-forward"
              disabled={!selectedVehicleId}
            />
          </View>
        )}

        {showNewForm && (
          <View style={styles.section}>
            <View style={styles.newHeader}>
              <MaterialCommunityIcons name="account-plus-outline" size={24} color={theme.colors.primary} />
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
                  leftIcon="person-outline"
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
                  leftIcon="mail-outline"
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

function createStyles(theme: any) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
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
    padding: 20,
    borderRadius: theme.radius.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 22,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 18,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  customerMobile: {
    fontSize: 15,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  tagBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    marginTop: 8,
  },
  tagText: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: theme.colors.bgMuted,
    paddingTop: 20,
    marginTop: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: theme.colors.bgMuted,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerEmail: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  vehicleList: {
    width: '100%',
    marginBottom: 20,
  },
  emptyVehicleState: {
    padding: 24,
    backgroundColor: theme.colors.bgMuted,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  emptyVehicleText: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  continueBtn: {
    marginTop: 24,
  },
  newHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(180, 83, 9, 0.1)',
  },
  newHeaderInfo: {
    marginLeft: 16,
  },
  newTitle: {
    fontSize: 16,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.primary,
  },
  newSubtitle: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});

}
