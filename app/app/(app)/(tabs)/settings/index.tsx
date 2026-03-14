import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Switch, 
  TouchableOpacity, 
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../../../src/constants/theme';
import { useAuthStore } from '../../../../src/store/auth.store';
import { useBiometric } from '../../../../src/hooks/useBiometric';
import { AppHeader } from '../../../../src/components/common/AppHeader';

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

  const getInitials = (name: string) => {
    return name?.charAt(0).toUpperCase() || 'A';
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
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.settingText}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingSubtitle}>{subtitle}</Text>
      </View>
      {onToggle ? (
        <Switch
          value={value!}
          onValueChange={onToggle}
          trackColor={{ false: theme.colors.bgMuted, true: theme.colors.primary }}
          thumbColor="white"
        />
      ) : (
        onPress && <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader 
        title="Settings" 
        subtitle="Manage your account and preferences" 
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(admin?.name || 'A')}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{admin?.name || 'Administrator'}</Text>
            <Text style={styles.userRole}>Store Admin</Text>
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionHeader}>Account & Security</Text>
        <View style={styles.settingsGroup}>
          {isBiometricSupported && renderSettingItem(
            'finger-print-outline',
            'Biometric Lock',
            'Unlock using Face/Fingerprint',
            biometricsEnabled,
            toggleBiometrics
          )}
          {renderSettingItem(
            'lock-closed-outline',
            'App Security PIN',
            'Change your 4-digit PIN',
            null,
            null,
            () => router.push({
                pathname: '/(auth)/pin',
                params: { flow: 'reset' }
            })
          )}
          {renderSettingItem(
            'mail-outline',
            'Email Address',
            admin?.email || 'admin@carstock.com',
            null,
            null,
            () => {}
          )}
        </View>

        {/* Preferences Section */}
        <Text style={styles.sectionHeader}>Preferences</Text>
        <View style={styles.settingsGroup}>
          {renderSettingItem(
            'notifications-outline',
            'Push Notifications',
            'Stock and billing alerts',
            notificationsEnabled,
            toggleNotifications
          )}
          {renderSettingItem(
            'moon-outline',
            'Appearance',
            'Follow system theme',
            null,
            null,
            () => {}
          )}
        </View>

        {/* Danger Zone Section */}
        <Text style={styles.sectionHeader}>Danger Zone</Text>
        <View style={styles.settingsGroup}>
          <TouchableOpacity style={styles.logoutItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(185, 28, 28, 0.05)' }]}>
              <Ionicons name="log-out-outline" size={20} color="#B91C1C" />
            </View>
            <Text style={styles.logoutText}>Log Out Account</Text>
            <Ionicons name="chevron-forward" size={20} color="#A8A29E" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.versionText}>CarStock Admin v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 CarStock Engine</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.15)',
  },
  avatarText: {
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  userRole: {
    fontSize: 14,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 12,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 20,
    marginBottom: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.bgMuted,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.error,
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  versionText: {
    fontSize: 12,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textSecondary,
  },
  copyrightText: {
    fontSize: 11,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
});

