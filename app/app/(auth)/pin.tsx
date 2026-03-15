import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  Vibration
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  withRepeat
} from 'react-native-reanimated';
import { theme } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/auth.store';
import { storage } from '../../src/utils/storage';
import { useBiometric } from '../../src/hooks/useBiometric';

export default function PinScreen() {
  const router = useRouter();
  const { flow } = useLocalSearchParams<{ flow?: string }>();
  const setPinVerified = useAuthStore((state) => state.setPinVerified);
  const { authenticate, checkAvailability } = useBiometric();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [storedPin, setStoredPin] = useState<string | null>(null);

  const shakeOffset = useSharedValue(0);

  useEffect(() => {
    const checkPin = async () => {
      const pinValue = await storage.getPin();
      const available = await checkAvailability();
      setIsBiometricSupported(available);
      
      if (!pinValue) {
        setIsSettingUp(true);
      } else {
        setStoredPin(pinValue);
        const bioEnabled = await storage.getBiometricsEnabled();
        if (available && bioEnabled) {
          handleBiometric();
        }
      }
    };
    checkPin();
  }, []);

  const handleBiometric = async () => {
    const success = await authenticate();
    if (success) {
      setPinVerified(true);
      router.replace('/(app)/(tabs)/dashboard');
    }
  };

  const triggerShake = () => {
    Vibration.vibrate([0, 100, 50, 100]);
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withRepeat(withTiming(10, { duration: 100 }), 3, true),
      withTiming(0, { duration: 50 })
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      if (newPin.length === 4) {
        handleComplete(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleComplete = async (enteredPin: string) => {
    if (isSettingUp) {
      if (!isConfirming) {
        setConfirmPin(enteredPin);
        setPin('');
        setIsConfirming(true);
      } else {
        if (enteredPin === confirmPin) {
          await storage.setPin(enteredPin);
          setPinVerified(true);
          router.replace('/(app)/(tabs)/dashboard');
        } else {
          triggerShake();
          Alert.alert('Error', 'PINs do not match. Try again.');
          setPin('');
          setConfirmPin('');
          setIsConfirming(false);
        }
      }
    } else {
      if (enteredPin === storedPin) {
        if (flow === 'reset') {
          setIsSettingUp(true);
          setConfirmPin('');
          setPin('');
          setIsConfirming(false);
          setStoredPin(null);
        } else {
          setPinVerified(true);
          router.replace('/(app)/(tabs)/dashboard');
        }
      } else {
        triggerShake();
        setPin('');
      }
    }
  };

  const renderKeypad = () => {
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];
    return (
      <View style={styles.keypad}>
        {keys.map((key, index) => {
          if (key === '') return <View key={index} style={styles.key} />;
          
          return (
            <TouchableOpacity 
              key={index} 
              style={styles.key} 
              onPress={() => key === 'delete' ? handleDelete() : handleKeyPress(key)}
            >
              {key === 'delete' ? (
                <MaterialCommunityIcons name="backspace-outline" size={28} color={theme.colors.bgCard} />
              ) : (
                <Text style={styles.keyText}>{key}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="lock-reset" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>
          {isSettingUp 
            ? (isConfirming ? 'Confirm Your PIN' : 'Set Up Your PIN') 
            : 'Verify Your Identity'}
        </Text>
        <Text style={styles.subtitle}>
          {isSettingUp 
            ? 'Create a 4-digit PIN for security' 
            : 'Use biometric or PIN to continue'}
        </Text>
      </View>

      <Animated.View style={[styles.dotsContainer, animatedStyle]}>
        {[1, 2, 3, 4].map((i) => (
          <View 
            key={i} 
            style={[
              styles.dot, 
              pin.length >= i && styles.dotFilled
            ]} 
          />
        ))}
      </Animated.View>

      {!isSettingUp && isBiometricSupported && (
        <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
          <MaterialCommunityIcons name="fingerprint" size={48} color={theme.colors.primary} />
          <Text style={styles.biometricText}>Use Biometric</Text>
        </TouchableOpacity>
      )}

      <View style={styles.bottomSection}>
        {renderKeypad()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.textPrimary,
    paddingTop: 80,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(180, 83, 9, 0.1)', // primary at low opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: theme.colors.bgCard,
    fontSize: 26,
    fontFamily: theme.font.heading,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    fontFamily: theme.font.body,
    marginTop: 8,
    opacity: 0.8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 15,
  },
  dotFilled: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  biometricBtn: {
    alignItems: 'center',
    marginBottom: 40,
  },
  biometricText: {
    color: theme.colors.primary,
    fontFamily: theme.font.bodyMedium,
    marginTop: 8,
  },
  bottomSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  key: {
    width: '33.33%',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    color: theme.colors.bgCard,
    fontSize: 30,
    fontFamily: theme.font.heading,
  },
});
