import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert,
  SafeAreaView
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/auth.store';
import { useBiometric } from '../../../src/hooks/useBiometric';
import { AppButton } from '../../../src/components/common/AppButton';
import { AppCard } from '../../../src/components/common/AppCard';

export default function SettingsScreen() {
  const router = useRouter();
  const { admin, clearAuth } = useAuthStore();
  const { authenticate, checkAvailability } = useBiometric();
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const bio = await AsyncStorage.getItem('biometrics_enabled');
      setBiometricsEnabled(bio === 'true');
      
      const notif = await AsyncStorage.getItem('notifications_enabled');
      const available = await checkAvailability();
      setIsBiometricSupported(available);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const toggleBiometrics = async (value: boolean) => {
    if (value) {
      const success = await authenticate();
      if (success) {
        setBiometricsEnabled(true);
        await AsyncStorage.setItem('biometrics_enabled', 'true');
      } else {
        setBiometricsEnabled(false);
      }
    } else {
      setBiometricsEnabled(false);
      await AsyncStorage.setItem('biometrics_enabled', 'false');
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications_enabled', value.toString());
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive', 
          onPress: () => clearAuth() 
        },
      ]
    );
  };

  const renderSettingItem = (
    icon: string, 
    title: string, 
    subtitle: string, 
    value: boolean | null = null, 
    onToggle: ((v: boolean) => void) | null = null,
    onPress: (() => void) | null = null
  ) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress || undefined} 
      disabled={!onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: Colors.offWhite }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color={Colors.primary} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {onToggle ? (
        <Switch
          value={value!}
          onValueChange={onToggle}
          trackColor={{ false: Colors.grey200, true: Colors.primary + '80' }}
          thumbColor={value ? Colors.primary : Colors.grey300}
        />
      ) : (
        onPress && <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.grey300} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <AppCard style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{admin?.name?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{admin?.name}</Text>
              <Text style={styles.userRole}>Store Administrator</Text>
            </View>
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="email-outline" size={16} color={Colors.grey500} />
              <Text style={styles.detailText}>{admin?.email}</Text>
            </View>
          </View>
        </AppCard>

        {/* Security Section */}
        <Text style={styles.sectionHeader}>Security</Text>
        <View style={styles.settingsGroup}>
          {isBiometricSupported && renderSettingItem(
            'fingerprint',
            'Biometric Lock',
            'Unlock app using Fingerprint/FaceID',
            biometricsEnabled,
            toggleBiometrics
          )}
          {renderSettingItem(
            'lock-outline',
            'Change App PIN',
            'Update your 4-digit security PIN',
            null,
            null,
            () => router.push({
                pathname: '/(auth)/pin',
                params: { flow: 'reset' }
            })
          )}
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            'bell-outline',
            'Push Notifications',
            'Receive alerts for low stock and new bills',
            notificationsEnabled,
            toggleNotifications
          )}
        </View>

        {/* Support Section */}
        <Text style={styles.sectionHeader}>Support</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            'help-circle-outline',
            'Help Center',
            'User guides and documentation',
            null,
            null,
            () => Alert.alert('Help Center', 'Redirecting to support portal...')
          )}
          {renderSettingItem(
            'information-outline',
            'About CarStock',
            'Version 1.0.0 (Build 24)',
            null,
            null,
            () => {}
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color={Colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Powered by CarStock Engine</Text>
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
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  profileCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    marginTop: Spacing.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.white,
  },
  profileInfo: {
    marginLeft: Spacing.md,
  },
  userName: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  userRole: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  profileDetails: {
    borderTopWidth: 1,
    borderTopColor: Colors.grey100,
    paddingTop: Spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.grey600,
    marginLeft: Spacing.sm,
  },
  sectionHeader: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.grey400,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  settingsGroup: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
    ...Shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey100,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  settingTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.dark,
  },
  settingSubtitle: {
    fontSize: 10,
    color: Colors.grey500,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF1F2',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.errorLight,
  },
  logoutText: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.error,
    marginLeft: Spacing.sm,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 10,
    color: Colors.grey400,
    marginTop: Spacing.xxl,
  },
});
