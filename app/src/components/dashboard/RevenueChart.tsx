import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
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
    frontColor: Colors.primary,
    topLabelComponent: () => (
      <Text style={styles.barLabel}>
        {item.revenue > 0 ? formatCurrency(item.revenue) : ''}
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
          width={width - Spacing.md * 4 - 32}
          height={180}
          barWidth={32}
          spacing={12}
          roundedTop
          roundedBottom={false}
          hideRules={false}
          rulesColor={Colors.grey200}
          rulesType="solid"
          noOfSections={4}
          maxValue={Math.ceil(maxValue * 1.2)}
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={Colors.grey200}
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
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  title: {
    fontSize: Typography.fontSizes.md,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
    marginBottom: Spacing.sm,
  },
  chartWrapper: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  barLabel: {
    fontSize: 9,
    color: Colors.grey500,
    marginBottom: 2,
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.grey500,
  },
  emptyContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  emptyText: {
    color: Colors.grey500,
    fontSize: Typography.fontSizes.sm,
  },
});