import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { theme } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

interface RevenueData {
  day: string;
  revenue: number;
}

interface RevenueChartProps {
  data: RevenueData[];
}

const { width } = Dimensions.get('window');

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No revenue data available</Text>
      </View>
    );
  }

  const chartData = data.map((item) => ({
    value: item.revenue,
    label: item.day,
    frontColor: theme.colors.primary,
    topLabelComponent: () => (
      <Text style={styles.barLabel}>
        {item.revenue > 0 ? (item.revenue / 1000).toFixed(1) + 'k' : ''}
      </Text>
    ),
  }));

  const maxValue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue This Week</Text>
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          width={width - 20 * 2 - theme.spacing.md * 2 - 20}
          height={180}
          barWidth={32}
          spacing={12}
          roundedTop
          roundedBottom={false}
          hideRules={false}
          rulesColor={theme.colors.bgMuted}
          rulesType="solid"
          noOfSections={4}
          maxValue={Math.ceil(maxValue * 1.2)}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={theme.colors.bgMuted}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          isAnimated
          animationDuration={600}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgCard,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    ...theme.shadow.card,
  },
  title: {
    fontSize: 15,
    fontFamily: theme.font.body,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  barLabel: {
    fontSize: 9,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  axisLabel: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    ...theme.shadow.card,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontFamily: theme.font.body,
    fontSize: 14,
  },
});