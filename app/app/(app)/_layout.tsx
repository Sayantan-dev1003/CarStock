import React, { useEffect } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth.store';

export default function AppLayout() {
  const { isAuthenticated, isPinVerified } = useAuthStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!isPinVerified) {
      router.push('/(auth)/pin');
    }
  }, [isAuthenticated, isPinVerified]);

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 8,
          paddingTop: 5,
          borderTopWidth: 1,
          borderTopColor: Colors.grey200,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarHideOnKeyboard: true,
        headerShown: false,
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
        name="inventory/product-detail"
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
        name="customers/customer-detail"
        options={{ tabBarButton: () => null }}
      />
      <Tabs.Screen
        name="customers/[id]"
        options={{ tabBarButton: () => null }}
      />
    </Tabs>
  );
}