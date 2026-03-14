import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth.store';

export default function AppLayout() {
  const { isAuthenticated, isPinVerified } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!isPinVerified) {
      router.push('/(auth)/pin');
    }
  }, [isAuthenticated, isPinVerified]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          height: 68 + insets.bottom,
          paddingTop: 5,
          paddingBottom: insets.bottom,
          backgroundColor: theme.colors.bgCard,
          borderTopWidth: 0,
          borderTopColor: theme.colors.border,
          ...theme.shadow.sm,
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: theme.font.bodyMedium,
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="dashboard/index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="billing/index"
        options={{
          title: 'Billing',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory/index"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "cube" : "cube-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers/index"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "settings" : "settings-outline"} size={24} color={color} />
          ),
        }}
      />

      {/* Hide all nested screens from tab bar
          Using tabBarButton: () => null keeps
          parent tab highlighted */}
      <Tabs.Screen
        name="billing/customer-select"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="billing/payment"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="billing/bill-success"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="inventory/add-product"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="inventory/[id]"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="customers/[id]"
        options={{ tabBarButton: () => null }}
      />
    </Tabs>
  );
}