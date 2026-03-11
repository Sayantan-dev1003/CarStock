import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { useAuthStore } from '../../../src/store/auth.store';
import { authApi } from '../../../src/api/auth.api';
import { storage } from '../../../src/utils/storage';

export default function SettingsScreen() {
    const router = useRouter();
    const { admin, logout: clearAuth } = useAuthStore();
    const [biometricEnabled, setBiometricEnabled] = useState(true);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout from CarStock Admin?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authApi.logout();
                        } catch (e) {
                            // Even if API fails, clear local session
                        }
                        await clearAuth();
                        router.replace('/(auth)/login');
                    },
                },
            ]
        );
    };

    const renderSettingItem = (
        icon: string,
        label: string,
        value?: string,
        onPress?: () => void,
        showSwitch: boolean = false
    ) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress || showSwitch}
        >
            <View style={styles.settingIcon}>
                <MaterialCommunityIcons name={icon as any} size={22} color={Colors.grey700} />
            </View>
            <View style={styles.settingLabelContainer}>
                <Text style={styles.settingLabel}>{label}</Text>
                {value && <Text style={styles.settingValue}>{value}</Text>}
            </View>
            {showSwitch ? (
                <Switch
                    value={biometricEnabled}
                    onValueChange={setBiometricEnabled}
                    trackColor={{ false: Colors.grey200, true: Colors.primary + '80' }}
                    thumbColor={biometricEnabled ? Colors.primary : Colors.grey100}
                />
            ) : onPress ? (
                <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.grey300} />
            ) : null}
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
                <Text style={styles.title}>Settings</Text>
            </View>

            {/* Profile Section */}
            <View style={styles.profileCard}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{admin?.name?.charAt(0).toUpperCase()}</Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={styles.adminName}>{admin?.name || 'Admin User'}</Text>
                    <Text style={styles.adminEmail}>{admin?.email}</Text>
                </View>
            </View>

            {/* Shop Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shop Information</Text>
                <View style={styles.card}>
                    {renderSettingItem('store-outline', 'Shop Name', admin?.shopName)}
                    {renderSettingItem('map-marker-outline', 'Location', admin?.address || 'India')}
                </View>
            </View>

            {/* Security Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>
                <View style={styles.card}>
                    {renderSettingItem('lock-outline', 'Change PIN', undefined, () => {
                        router.push('/(auth)/pin');
                    })}
                    {renderSettingItem('fingerprint', 'Biometric Authentication', undefined, undefined, true)}
                </View>
            </View>

            {/* App Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Application</Text>
                <View style={styles.card}>
                    {renderSettingItem('bell-outline', 'Notifications', 'Enabled', () => { })}
                    {renderSettingItem('update', 'Check for Updates', 'v1.0.0', () => { })}
                    {renderSettingItem('help-circle-outline', 'Support & Help', undefined, () => { })}
                    {renderSettingItem('file-document-outline', 'Privacy Policy', undefined, () => { })}
                </View>
            </View>

            <AppButton
                title="Logout"
                onPress={handleLogout}
                variant="outline"
                icon="logout"
                style={styles.logoutBtn}
                textStyle={{ color: Colors.error }}
            />

            <Text style={styles.versionText}>CarStock Admin Dashboard v1.0.0</Text>
            <Text style={styles.footerText}>Made with ❤️ for Car Accessories Shops</Text>
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
        paddingBottom: Spacing.xxxl,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    title: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.white,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        ...Shadows.sm,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.white,
    },
    profileInfo: {
        marginLeft: Spacing.md,
    },
    adminName: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    adminEmail: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey500,
        marginTop: 2,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        fontSize: Typography.fontSizes.xs,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.grey500,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    card: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.lg,
        paddingLeft: Spacing.lg,
        ...Shadows.sm,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingRight: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey100,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: Colors.offWhite,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingLabelContainer: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    settingLabel: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.medium,
        color: Colors.dark,
    },
    settingValue: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
        marginTop: 2,
    },
    logoutBtn: {
        marginTop: Spacing.md,
        borderColor: Colors.error + '40',
        backgroundColor: Colors.white,
    },
    versionText: {
        textAlign: 'center',
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey400,
        marginTop: Spacing.xxl,
    },
    footerText: {
        textAlign: 'center',
        fontSize: 10,
        color: Colors.grey300,
        marginTop: 4,
    },
});
