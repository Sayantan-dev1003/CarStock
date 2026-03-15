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
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const NavBarSetter = () => {
  const { isDarkMode, theme } = useTheme();
  
  useEffect(() => {
    const setup = async () => {
      try {
        await NavigationBar.setBackgroundColorAsync(isDarkMode ? '#121110' : '#FFFFFF');
        await NavigationBar.setButtonStyleAsync(isDarkMode ? 'light' : 'dark');
      } catch (e) {
        // edge-to-edge mode, navigation bar color managed by system 
      }
    };
    setup();
  }, [isDarkMode]);

  const statusStyle = isDarkMode ? "light" : "dark";
  const statusColor = isDarkMode ? "#121110" : theme.colors.bg || "#FAF9F6";

  return <StatusBar style={statusStyle} backgroundColor={statusColor} translucent={false} />;
};

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

    return () => {
      authEvents.off('auth:logout', handleLogout);
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavBarSetter />
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
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
