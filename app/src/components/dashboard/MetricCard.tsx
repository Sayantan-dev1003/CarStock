import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { AppCard } from '../common/AppCard';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  trend?: {
    value: number;
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
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color={Colors.primary} />
        </View>
        {trend && (
          <View style={[
            styles.trendBadge,
            { backgroundColor: trend.isPositive ? Colors.successLight : Colors.errorLight }
          ]}>
            <MaterialCommunityIcons 
              name={trend.isPositive ? 'arrow-up' : 'arrow-down'} 
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
      
      <View style={styles.content}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: Spacing.xs,
    borderTopWidth: 4,
    borderTopColor: Colors.primary,
    minHeight: 140,
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
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  trendText: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    marginLeft: 2,
  },
  content: {
    marginTop: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.primary,
  },
  title: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: Typography.fontWeights.semibold,
    color: Colors.dark,
    marginTop: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
  },
});
