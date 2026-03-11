import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth.store';
import { useSocket } from '../../src/hooks/useSocket';

export default function AppLayout() {
    const router = useRouter();
    const { isAuthenticated, isPinVerified } = useAuthStore();

    // Initialize socket connection for the entire app session
    useSocket();

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace('/(auth)/login');
        } else if (!isPinVerified) {
            router.replace('/(auth)/pin');
        }
    }, [isAuthenticated, isPinVerified]);

    if (!isAuthenticated || !isPinVerified) {
        return null; // Guarding the app layout
    }

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.grey400,
                tabBarStyle: {
                    backgroundColor: Colors.white,
                    borderTopWidth: 1,
                    borderTopColor: Colors.grey200,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: Typography.fontWeights.medium,
                },
            }}
        >
            <Tabs.Screen
                name="dashboard/index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="billing/index"
                options={{
                    title: 'New Bill',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="receipt" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="inventory/index"
                options={{
                    title: 'Inventory',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="package-variant-closed" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="customers/index"
                options={{
                    title: 'Customers',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="account-group" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings/index"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="cog" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
