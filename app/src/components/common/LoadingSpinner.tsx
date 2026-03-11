import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Typography, Spacing } from '../../constants/theme';

interface LoadingSpinnerProps {
    size?: 'small' | 'large';
    color?: string;
    fullScreen?: boolean;
    message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = 'large',
    color = Colors.primary,
    fullScreen = false,
    message,
}) => {
    const containerStyle: ViewStyle = fullScreen
        ? { ...styles.fullScreen, backgroundColor: Colors.offWhite }
        : styles.centered;

    return (
        <View style={containerStyle}>
            <ActivityIndicator size={size} color={color} />
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    fullScreen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    centered: {
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
    },
    message: {
        marginTop: Spacing.md,
        fontSize: Typography.fontSizes.base,
        color: Colors.grey600,
        fontWeight: Typography.fontWeights.medium,
    },
});
