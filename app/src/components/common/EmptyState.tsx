import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { AppButton } from './AppButton';

interface EmptyStateProps {
    icon: string;
    title: string;
    subtitle?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    subtitle,
    actionLabel,
    onAction,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={icon as any} size={80} color={Colors.grey300} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {actionLabel && onAction && (
                <AppButton
                    title={actionLabel}
                    onPress={onAction}
                    variant="outline"
                    style={styles.button}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.screenBg,
    },
    iconContainer: {
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: Typography.fontSizes.lg,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.grey600,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: Typography.fontSizes.base,
        color: Colors.grey400,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: Typography.lineHeights.normal,
    },
    button: {
        minWidth: 150,
    },
});
