import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  const styles = createStyles(theme);
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
    gradientColor: theme.colors.primaryDark,
    showGradient: true,
  }));

  const maxValue = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <Text style={styles.title}>Weekly Performance</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.primary }]} />
          <Text style={styles.legendText}>Revenue</Text>
        </View>
      </View>
      <View style={styles.chartWrapper}>
        <BarChart
          data={chartData}
          width={width - 20 * 2 - theme.spacing.md * 2 - 20}
          height={160}
          barWidth={28}
          spacing={16}
          roundedTop
          hideRules={false}
          rulesColor={theme.colors.border}
          rulesType="dashed"
          noOfSections={3}
          maxValue={Math.ceil(maxValue * 1.2)}
          yAxisThickness={0}
          xAxisThickness={0}
          yAxisTextStyle={styles.axisLabel}
          xAxisLabelTextStyle={styles.axisLabel}
          isAnimated
          animationDuration={800}
        />
      </View>
    </View>
  );
};

function createStyles(theme: any) {
  return StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgCard,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontFamily: theme.font.heading,
    color: theme.colors.textPrimary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  chartWrapper: {
    alignItems: 'center',
    marginLeft: -10,
  },
  axisLabel: {
    fontSize: 10,
    fontFamily: theme.font.body,
    color: theme.colors.textMuted,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emptyText: {
    color: theme.colors.textMuted,
    fontFamily: theme.font.body,
    fontSize: 14,
  },
});
}
