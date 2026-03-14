import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';

export default function AppLayout() {
  const { isAuthenticated, isPinVerified } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!isPinVerified) {
      router.push('/(auth)/pin');
    }
  }, [isAuthenticated, isPinVerified]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="billing/customer-select" />
      <Stack.Screen name="billing/payment" />
      <Stack.Screen name="billing/bill-success" />
      <Stack.Screen name="inventory/add-product" />
      <Stack.Screen name="inventory/[id]" />
      <Stack.Screen name="customers/[id]" />
    </Stack>
  );
}