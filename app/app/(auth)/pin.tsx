import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withRepeat,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../src/constants/theme';
import { useBiometric } from '../../src/hooks/useBiometric';
import { useAuthStore } from '../../src/store/auth.store';
import { storage } from '../../src/utils/storage';

export default function PinScreen() {
    const router = useRouter();
    const setPinVerified = useAuthStore((state) => state.setPinVerified);
    const { authenticate, isAvailable } = useBiometric();

    const [pin, setPin] = useState('');
    const [storedPin, setStoredPin] = useState<string | null>(null);
    const [isSetup, setIsSetup] = useState(false);
    const [confirmPin, setConfirmPin] = useState('');
    const [setupStep, setSetupStep] = useState<'enter' | 'confirm'>('enter');

    const shakeTranslateX = useSharedValue(0);

    useEffect(() => {
        checkPinStatus();
    }, []);

    const checkPinStatus = async () => {
        const pin = await storage.getPin();
        if (pin) {
            setStoredPin(pin);
            setIsSetup(false);
            // Trigger biometric if available
            handleBiometric();
        } else {
            setIsSetup(true);
            setSetupStep('enter');
        }
    };

    const handleBiometric = async () => {
        const result = await authenticate();
        if (result.success) {
            setPinVerified(true);
            router.replace('/(app)/dashboard');
        }
    };

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

    const handleNumberPress = (num: number) => {
        if (isSetup) {
            if (setupStep === 'enter') {
                if (pin.length < 4) {
                    const newPin = pin + num;
                    setPin(newPin);
                    if (newPin.length === 4) {
                        setTimeout(() => {
                            setSetupStep('confirm');
                            setPin('');
                        }, 200);
                    }
                }
            } else {
                if (confirmPin.length < 4) {
                    const newPin = confirmPin + num;
                    setConfirmPin(newPin);
                    if (newPin.length === 4) {
                        handlePinSetup(newPin);
                    }
                }
            }
        } else {
            if (pin.length < 4) {
                const newPin = pin + num;
                setPin(newPin);
                if (newPin.length === 4) {
                    handlePinVerify(newPin);
                }
            }
        }
    };

    const handleDelete = () => {
        if (isSetup) {
            if (setupStep === 'enter') {
                setPin(pin.slice(0, -1));
            } else {
                setConfirmPin(confirmPin.slice(0, -1));
            }
        } else {
            setPin(pin.slice(0, -1));
        }
    };

    const handlePinSetup = async (confirmedPin: string) => {
        if (pin === '') { // This represents the first entry stored in state before step change? No, pin is cleared.
            // Oh, I need to keep the first pin to compare.
        }
        // Let's adjust setup logic
    };

    // Re-handling setup logic for clarity
    const onPinInput = async (digit: string) => {
        if (isSetup) {
            if (setupStep === 'enter') {
                const newPin = pin + digit;
                if (newPin.length <= 4) setPin(newPin);
                if (newPin.length === 4) {
                    setTimeout(() => {
                        setSetupStep('confirm');
                    }, 300);
                }
            } else {
                const newConfirm = confirmPin + digit;
                if (newConfirm.length <= 4) setConfirmPin(newConfirm);
                if (newConfirm.length === 4) {
                    if (newConfirm === pin) {
                        await storage.setPin(newConfirm);
                        setPinVerified(true);
                        router.replace('/(app)/dashboard');
                    } else {
                        shake();
                        Alert.alert('Error', 'PINs do not match. Try again.');
                        setPin('');
                        setConfirmPin('');
                        setSetupStep('enter');
                    }
                }
            }
        } else {
            const newPin = pin + digit;
            if (newPin.length <= 4) setPin(newPin);
            if (newPin.length === 4) {
                if (newPin === storedPin) {
                    setPinVerified(true);
                    router.replace('/(app)/dashboard');
                } else {
                    shake();
                    setPin('');
                }
            }
        }
    };

    const renderDots = () => {
        const length = isSetup && setupStep === 'confirm' ? confirmPin.length : pin.length;
        return (
            <View style={styles.dotsContainer}>
                {[1, 2, 3, 4].map((i) => (
                    <View
                        key={i}
                        style={[
                            styles.dot,
                            i <= length && styles.dotFilled,
                        ]}
                    />
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name="lock" size={40} color={Colors.primary} />
                </View>
                <Animated.View style={animatedStyle}>
                    <Text style={styles.title}>
                        {isSetup
                            ? (setupStep === 'enter' ? 'Set up your PIN' : 'Confirm your PIN')
                            : 'Verify Your Identity'}
                    </Text>
                    <Text style={styles.subtitle}>
                        {isSetup ? 'Create a 4-digit PIN for security' : 'Enter your PIN to continue'}
                    </Text>
                </Animated.View>
            </View>

            {renderDots()}

            {!isSetup && isAvailable && (
                <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
                    <MaterialCommunityIcons name="fingerprint" size={48} color={Colors.white} />
                    <Text style={styles.biometricText}>Use Biometric</Text>
                </TouchableOpacity>
            )}

            <View style={styles.keypad}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <TouchableOpacity
                        key={num}
                        style={styles.key}
                        onPress={() => onPinInput(num.toString())}
                    >
                        <Text style={styles.keyText}>{num}</Text>
                    </TouchableOpacity>
                ))}
                <View style={styles.key} />
                <TouchableOpacity
                    style={styles.key}
                    onPress={() => onPinInput('0')}
                >
                    <Text style={styles.keyText}>0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.key}
                    onPress={handleDelete}
                >
                    <MaterialCommunityIcons name="backspace-outline" size={24} color={Colors.white} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark,
        padding: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2D2D44',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.white,
        textAlign: 'center',
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.fontSizes.base,
        color: Colors.grey400,
        textAlign: 'center',
    },
    dotsContainer: {
        flexDirection: 'row',
        marginBottom: Spacing.xxxl,
    },
    dot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.grey600,
        marginHorizontal: Spacing.md,
    },
    dotFilled: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    biometricBtn: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    biometricText: {
        color: Colors.white,
        marginTop: Spacing.sm,
        fontSize: Typography.fontSizes.sm,
    },
    keypad: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    key: {
        width: '30%',
        aspectRatio: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.xs,
    },
    keyText: {
        fontSize: 28,
        fontWeight: Typography.fontWeights.medium,
        color: Colors.white,
    },
});
