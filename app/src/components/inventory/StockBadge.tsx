import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface StockBadgeProps {
    quantity: number;
    reorderLevel: number;
    size?: 'sm' | 'md';
}

export const StockBadge: React.FC<StockBadgeProps> = ({
    quantity,
    reorderLevel,
    size = 'md',
}) => {
    const getStatus = () => {
        if (quantity <= 0) return { label: 'Out of Stock', color: Colors.error, bgColor: Colors.errorLight };
        if (quantity <= reorderLevel) return { label: 'Low Stock', color: Colors.warning, bgColor: Colors.warningLight };
        return { label: 'In Stock', color: Colors.success, bgColor: Colors.successLight };
    };

    const status = getStatus();

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: status.bgColor },
                size === 'sm' ? styles.sm : styles.md,
            ]}
        >
            <Text style={[styles.text, { color: status.color }, size === 'sm' && styles.smText]}>
                {status.label}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.sm,
    },
    md: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
    },
    sm: {
        paddingVertical: 2,
        paddingHorizontal: Spacing.xs,
    },
    text: {
        fontSize: Typography.fontSizes.xs,
        fontWeight: Typography.fontWeights.bold,
    },
    smText: {
        fontSize: 10,
    },
});
