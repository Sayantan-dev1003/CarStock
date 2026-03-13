import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';
import { useAuthStore } from '../src/store/auth.store';
import { authEvents } from '../src/utils/eventEmitter';
import { queryClient } from '../src/utils/queryClient';
import { OfflineBanner } from '../src/components/common/OfflineBanner';

export default function RootLayout() {
  const { loadStoredTokens, clearAuth, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadStoredTokens();

    const handleLogout = async () => {
      await clearAuth();
      router.replace('/(auth)/login');
    };

    authEvents.on('auth:logout', handleLogout);

    return () => {
      authEvents.off('auth:logout', handleLogout);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(app)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
