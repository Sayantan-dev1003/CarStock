import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat
} from 'react-native-reanimated';
import { theme } from '../../src/constants/theme';
import { AppInput } from '../../src/components/common/AppInput';
import { AppButton } from '../../src/components/common/AppButton';
import { authApi } from '../../src/api/auth.api';
import { useAuthStore } from '../../src/store/auth.store';
import { getErrorMessage } from '../../src/utils/errorHandler';

const { height } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shakeOffset = useSharedValue(0);

  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const triggerShake = () => {
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 })
    );
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authApi.login(data);
      setTokens(response.accessToken, response.refreshToken);
      router.replace('/(auth)/pin');
    } catch (err) {
      const msg = getErrorMessage(err);
      setError(msg);
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
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

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Email Address"
                placeholder="Enter email address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' }
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <AppInput
                label="Password"
                placeholder="Enter password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                leftIcon="lock-closed-outline"
              />
            )}
          />

          <AppButton
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={loading}
            fullWidth
            size="lg"
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
    backgroundColor: theme.colors.textPrimary, // Sophisticated near-black
  },
  scrollContent: {
    flexGrow: 1,
  },
  topSection: {
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 88,
    height: 88,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadow.lg,
  },
  logoText: {
    color: theme.colors.bgCard,
    fontSize: 32,
    fontFamily: theme.font.heading,
  },
  appName: {
    color: theme.colors.bgCard,
    fontSize: 28,
    fontFamily: theme.font.heading,
    letterSpacing: -0.5,
  },
  tagline: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontFamily: theme.font.body,
    marginTop: theme.spacing.xs,
    opacity: 0.8,
  },
  bottomSection: {
    flex: 1,
    minHeight: height * 0.6,
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: theme.spacing.xl,
    ...theme.shadow.lg,
  },
  heading: {
    fontSize: 28,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  subheading: {
    fontSize: 15,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  version: {
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    fontFamily: theme.font.body,
    marginTop: 'auto',
    paddingTop: theme.spacing.xl,
    opacity: 0.6,
  },
});
