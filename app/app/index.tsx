import React, { useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { Colors, Spacing } from '../src/constants/theme';

export default function IndexPage() {
    const router = useRouter();
    const { isAuthenticated, loadStoredTokens } = useAuthStore();

    useEffect(() => {
        const checkAuth = async () => {
            // Small delay to show splash feel
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const hasToken = await loadStoredTokens();

            if (hasToken || isAuthenticated) {
                router.replace('/(app)/dashboard');
            } else {
                router.replace('/(auth)/login');
            }
        };

        checkAuth();
    }, []);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                {/* Placeholder for CarStock logo */}
                <View style={styles.logoCircle}>
                    <View style={styles.logoInner} />
                </View>
                <ActivityIndicator
                    size="large"
                    color={Colors.primary}
                    style={styles.loader}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoInner: {
        width: 60,
        height: 60,
        borderWidth: 8,
        borderColor: Colors.white,
        borderRadius: 10,
    },
    loader: {
        marginTop: Spacing.lg,
    },
});
