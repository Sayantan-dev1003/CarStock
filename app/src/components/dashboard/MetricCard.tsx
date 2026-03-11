import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppCard } from '../common/AppCard';
import { Colors, Typography, Spacing, Shadows, BorderRadius } from '../../constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle: string;
    icon: string;
    trend?: {
        value: number;
        label: string;
        isPositive: boolean;
    };
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
}) => {
    return (
        <AppCard style={styles.container}>
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={icon as any} size={24} color={Colors.primary} />
                </View>
                {trend && (
                    <View style={[
                        styles.trendContainer,
                        { backgroundColor: trend.isPositive ? Colors.successLight : Colors.errorLight }
                    ]}>
                        <MaterialCommunityIcons
                            name={trend.isPositive ? "arrow-up" : "arrow-down"}
                            size={12}
                            color={trend.isPositive ? Colors.success : Colors.error}
                        />
                        <Text style={[
                            styles.trendText,
                            { color: trend.isPositive ? Colors.success : Colors.error }
                        ]}>
                            {trend.value}%
                        </Text>
                    </View>
                )}
            </View>

            <Text style={styles.value}>{value}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </AppCard>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.md,
        borderTopWidth: 4,
        borderTopColor: Colors.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        backgroundColor: Colors.offWhite,
        alignItems: 'center',
        justifyContent: 'center',
    },
    value: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
        fontWeight: Typography.fontWeights.medium,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    trendText: {
        fontSize: 10,
        fontWeight: Typography.fontWeights.bold,
        marginLeft: 2,
    },
});
