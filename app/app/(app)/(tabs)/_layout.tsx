import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../src/constants/theme';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  const [fontsLoaded] = useFonts({
    ...MaterialCommunityIcons.font,
  });

  if (!fontsLoaded) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.grey400,
        tabBarStyle: {
          backgroundColor: Colors.white,
          height: 50 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopColor: Colors.grey200,
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
            <MaterialCommunityIcons
              name="view-dashboard"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="billing/index"
        options={{
          title: 'New Bill',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="receipt"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory/index"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="customers/index"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-group"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/index"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="cog"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

