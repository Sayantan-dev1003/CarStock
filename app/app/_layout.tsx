import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Outfit_600SemiBold } from '@expo-google-fonts/outfit';
import * as NavigationBar from 'expo-navigation-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../src/store/auth.store';
import { authEvents } from '../src/utils/eventEmitter';
import { queryClient } from '../src/utils/queryClient';
import { OfflineBanner } from '../src/components/common/OfflineBanner';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../src/constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { loadStoredTokens, clearAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Outfit_600SemiBold,
  });

  useEffect(() => {
    loadStoredTokens();

    const handleLogout = async () => {
      await clearAuth();
      router.replace('/(auth)/login');
    };

    authEvents.on('auth:logout', handleLogout);

    // Wrap in try-catch — throws on edge-to-edge enabled devices
    const setupNavigationBar = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync('#FFFFFF'); 
        await NavigationBar.setButtonStyleAsync('dark');
      } catch (e) {
        // edge-to-edge mode, navigation bar color managed by system
      }
    };
    
    setupNavigationBar();

    return () => {
      authEvents.off('auth:logout', handleLogout);
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded (or a error was returned) and the UI is ready.
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider>
          <StatusBar style="dark" backgroundColor="#FAF9F6" translucent={false} />
          <OfflineBanner />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
