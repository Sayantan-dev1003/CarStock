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
    <SafeAreaView style={styles.safeArea}>
      <AppHeader title="Settings" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(admin?.name || '')}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{admin?.name || 'Administrator'}</Text>
            <Text style={styles.userEmail}>{admin?.email}</Text>
          </View>
        </View>

        {/* Security Section */}
        <Text style={styles.sectionHeader}>Security</Text>
        <View style={styles.settingsGroup}>
          {isBiometricSupported && renderSettingItem(
            'finger-print-outline',
            'Biometric Lock',
            'Unlock app using Fingerprint/FaceID',
            biometricsEnabled,
            toggleBiometrics
          )}
          {renderSettingItem(
            'lock-closed-outline',
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
            'notifications-outline',
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
            'information-circle-outline',
            'About CarStock',
            'Version 1.0.0 (Build 24)',
            null,
            null,
            () => {}
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Powered by CarStock Engine</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  profileCard: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadow.card,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
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
    fontSize: 18,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
  },
  userEmail: {
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
    marginBottom: theme.spacing.sm,
    marginLeft: 4,
  },
  settingsGroup: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xl,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
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
    marginLeft: theme.spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.bgCard,
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(185, 28, 28, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.error,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 40,
    opacity: 0.8,
  },
});

