import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { queryClient } from '../src/utils/queryClient';
import { useAuthStore } from '../src/store/auth.store';
import { authEvents } from '../src/utils/eventEmitter';
import { OfflineBanner } from '../src/components/common/OfflineBanner';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
    const router = useRouter();
    const { loadStoredTokens, clearAuth } = useAuthStore();

    useEffect(() => {
        // 1. Load tokens on mount
        loadStoredTokens();

        // 2. Listen to logout event
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
            <SafeAreaProvider>
                <PaperProvider>
                    <StatusBar style="auto" />
                    <OfflineBanner />
                    <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                        <Stack.Screen name="(app)" options={{ animation: 'fade' }} />
                    </Stack>
                </PaperProvider>
            </SafeAreaProvider>
        </QueryClientProvider>
    );
}
