import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
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
    <View style={styles.card}>
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
          {trend && (
            <View style={styles.trendBadge}>
              <Ionicons 
                name={trend.isPositive ? 'arrow-up' : 'arrow-down'} 
                size={12} 
                color={trend.isPositive ? theme.colors.success : theme.colors.error} 
              />
              <Text style={[
                styles.trendText,
                { color: trend.isPositive ? theme.colors.success : theme.colors.error }
              ]}>
                {trend.value}%
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    flexDirection: 'row',
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  accent: {
    width: 4,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  trendText: {
    fontSize: 11,
    fontFamily: theme.font.body,
    fontWeight: '700',
    marginLeft: 2,
  },
  value: {
    fontSize: 26,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
});
