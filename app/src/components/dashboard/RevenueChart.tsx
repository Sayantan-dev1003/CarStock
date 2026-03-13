import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { CartesianChart, Bar, useChartPressState } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { formatCurrency } from '../../utils/format';

interface RevenueData {
  day: string;
  revenue: number;
  [key: string]: string | number;
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Revenue This Week</Text>
      <View style={{ height: 220, width: '100%' }}>
        <CartesianChart
          data={data}
          xKey="day"
          yKeys={["revenue"]}
          padding={{ top: 20, bottom: 20, left: 10, right: 10 }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.revenue}
              chartBounds={chartBounds}
              color={Colors.primary}
              roundedCorners={{
                topLeft: 4,
                topRight: 4,
              }}
            />
          )}
        </CartesianChart>
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
  chartContainer: {
    alignItems: 'center',
    marginLeft: -Spacing.md, // Offset chart padding
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
