import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
} from 'react-native-reanimated';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const OfflineBanner = () => {
    const [isOffline, setIsOffline] = useState(false);
    const insets = useSafeAreaInsets();
    const translateY = useSharedValue(-100);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener((state) => {
            const offline = state.isConnected === false;
            setIsOffline(offline);
            translateY.value = withTiming(offline ? 0 : -100, { duration: 300 });
        });

        return () => unsubscribe();
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
        paddingTop: Math.max(insets.top, Spacing.sm),
    }));

    if (!isOffline && translateY.value === -100) return null;

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <Text style={styles.text}>
                No internet connection — changes will sync when reconnected
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: Colors.error,
        paddingBottom: Spacing.sm,
        paddingHorizontal: Spacing.md,
        zIndex: 9999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: Colors.white,
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.medium,
        textAlign: 'center',
    },
});
