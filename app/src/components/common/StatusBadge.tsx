import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface StatusBadgeProps {
    status: string;
    variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
    style?: ViewStyle;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant = 'default',
    style,
}) => {
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'success':
                return { backgroundColor: Colors.successLight };
            case 'warning':
                return { backgroundColor: Colors.warningLight };
            case 'error':
                return { backgroundColor: Colors.errorLight };
            case 'info':
                return { backgroundColor: Colors.infoLight };
            default:
                return { backgroundColor: Colors.grey100 };
        }
    };

    const getTextStyle = (): TextStyle => {
        switch (variant) {
            case 'success':
                return { color: Colors.success };
            case 'warning':
                return { color: Colors.warning };
            case 'error':
                return { color: Colors.error };
            case 'info':
                return { color: Colors.info };
            default:
                return { color: Colors.grey600 };
        }
    };

    return (
        <View style={[styles.badge, getVariantStyles(), style]}>
            <Text style={[styles.text, getTextStyle()]}>
                {status.toUpperCase()}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs / 2,
        borderRadius: BorderRadius.full,
        alignSelf: 'flex-start',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: Typography.fontSizes.xs,
        fontWeight: Typography.fontWeights.bold,
    },
});
