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
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../src/constants/theme';
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
                placeholder="admin@carstock.com"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="email-outline"
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
                placeholder="********"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                leftIcon="lock-outline"
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
    backgroundColor: Colors.dark,
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
    width: 80,
    height: 80,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.xxl,
    fontWeight: Typography.fontWeights.bold,
  },
  appName: {
    color: Colors.white,
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
  },
  tagline: {
    color: Colors.grey400,
    fontSize: Typography.fontSizes.sm,
    marginTop: Spacing.xs,
  },
  bottomSection: {
    flex: 1,
    minHeight: height * 0.6,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: Spacing.xl,
    ...Shadows.lg,
  },
  heading: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginBottom: 4,
  },
  subheading: {
    fontSize: Typography.fontSizes.base,
    color: Colors.grey500,
    marginBottom: Spacing.xl,
  },
  button: {
    marginTop: Spacing.lg,
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.fontSizes.sm,
    marginBottom: Spacing.md,
    textAlign: 'center',
    fontWeight: Typography.fontWeights.medium,
  },
  version: {
    textAlign: 'center',
    color: Colors.grey400,
    fontSize: Typography.fontSizes.xs,
    marginTop: 'auto',
    paddingTop: Spacing.xl,
  },
});
