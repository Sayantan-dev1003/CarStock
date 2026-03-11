import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Dimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withRepeat,
} from 'react-native-reanimated';
import { AppInput } from '../../src/components/common/AppInput';
import { AppButton } from '../../src/components/common/AppButton';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/utils/errorHandler';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
    const router = useRouter();
    const setTokens = useAuthStore((state) => state.setTokens);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const shakeTranslateX = useSharedValue(0);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const shake = () => {
        shakeTranslateX.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withTiming(10, { duration: 100 }), 3, true),
            withTiming(0, { duration: 50 })
        );
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeTranslateX.value }],
    }));

    const onSubmit = async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const { accessToken, refreshToken } = await authApi.login(data);
            await setTokens(accessToken, refreshToken);
            router.replace('/(auth)/pin');
        } catch (err) {
            setError(getErrorMessage(err));
            shake();
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                bounces={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.topSection}>
                    <View style={styles.logoContainer}>
                        <Text style={styles.logoText}>CS</Text>
                    </View>
                    <Text style={styles.appName}>CarStock Admin</Text>
                    <Text style={styles.tagline}>Car Accessories Management</Text>
                </View>

                <Animated.View style={[styles.bottomSection, animatedStyle]}>
                    <Text style={styles.heading}>Welcome Back</Text>
                    <Text style={styles.subheading}>Sign in to your admin account</Text>

                    {error && <Text style={styles.serverError}>{error}</Text>}

                    <Controller
                        control={control}
                        name="email"
                        rules={{
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="Email Address"
                                placeholder="admin@carstock.com"
                                value={value}
                                onChangeText={onChange}
                                error={errors.email?.message}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!loading}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name="password"
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        }}
                        render={({ field: { onChange, value } }) => (
                            <AppInput
                                label="Password"
                                placeholder="••••••••"
                                value={value}
                                onChangeText={onChange}
                                error={errors.password?.message}
                                secureTextEntry
                                editable={!loading}
                            />
                        )}
                    />

                    <AppButton
                        title="Sign In"
                        onPress={handleSubmit(onSubmit)}
                        loading={loading}
                        fullWidth
                        style={styles.button}
                    />

                    <Text style={styles.version}>v1.0.0</Text>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark,
    },
    scrollContent: {
        flexGrow: 1,
    },
    topSection: {
        height: height * 0.4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoContainer: {
        width: 80,
        height: 80,
        backgroundColor: Colors.primary,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.md,
        ...Shadows.md,
    },
    logoText: {
        color: Colors.white,
        fontSize: 32,
        fontWeight: Typography.fontWeights.extrabold,
    },
    appName: {
        color: Colors.white,
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        marginBottom: Spacing.xs,
    },
    tagline: {
        color: Colors.grey400,
        fontSize: Typography.fontSizes.sm,
    },
    bottomSection: {
        flex: 1,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: Spacing.xl,
        minHeight: height * 0.6,
    },
    heading: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: 2,
    },
    subheading: {
        fontSize: Typography.fontSizes.base,
        color: Colors.grey500,
        marginBottom: Spacing.xl,
    },
    serverError: {
        color: Colors.error,
        backgroundColor: Colors.errorLight,
        padding: Spacing.sm,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.md,
        fontSize: Typography.fontSizes.sm,
        textAlign: 'center',
    },
    button: {
        marginTop: Spacing.md,
    },
    version: {
        marginTop: 'auto',
        textAlign: 'center',
        color: Colors.grey400,
        fontSize: Typography.fontSizes.xs,
        paddingTop: Spacing.lg,
    },
});
