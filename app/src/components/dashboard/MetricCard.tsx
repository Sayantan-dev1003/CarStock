import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  variant?: 'primary' | 'secondary';
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
  variant = 'secondary',
  trend,
}) => {
  const isPrimary = variant === 'primary';

  return (
    <View style={[
      styles.card, 
      isPrimary && styles.cardPrimary
    ]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[
            styles.iconCircle,
            isPrimary && styles.iconCirclePrimary
          ]}>
            <Ionicons 
              name={icon} 
              size={18} 
              color={isPrimary ? theme.colors.bgCard : theme.colors.primary} 
            />
          </View>
          {trend && (
            <View style={[
              styles.trendBadge,
              isPrimary && styles.trendBadgePrimary
            ]}>
              <Ionicons 
                name={trend.isPositive ? 'arrow-up' : 'arrow-down'} 
                size={12} 
                color={isPrimary ? '#FEF3C7' : (trend.isPositive ? theme.colors.success : theme.colors.error)} 
              />
              <Text style={[
                styles.trendText,
                { color: isPrimary ? '#FEF3C7' : (trend.isPositive ? theme.colors.success : theme.colors.error) }
              ]}>
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
        <Text style={[
          styles.value,
          isPrimary && styles.valuePrimary
        ]}>{value}</Text>
        <Text style={[
          styles.title,
          isPrimary && styles.titlePrimary
        ]}>{title}</Text>
        {subtitle && (
          <Text style={[
            styles.subtitle,
            isPrimary && styles.subtitlePrimary
          ]}>{subtitle}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.bgCard,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  cardPrimary: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconCircle: {
    width: 32,    height: 32,
    borderRadius: 12,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCirclePrimary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trendBadgePrimary: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  trendText: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    marginLeft: 2,
  },
  value: {
    fontSize: 24,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  valuePrimary: {
    color: theme.colors.bgCard,
  },
  title: {
    fontSize: 12,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textSecondary,
  },
  titlePrimary: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  subtitle: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  subtitlePrimary: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
