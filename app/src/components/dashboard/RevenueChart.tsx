import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTheme } from 'victory-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface RevenueChartProps {
    data: { day: string; revenue: number }[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
    const screenWidth = Dimensions.get('window').width;

    if (!data || data.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No revenue data available for this week</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <VictoryChart
                theme={VictoryTheme.material}
                width={screenWidth - Spacing.lg * 2}
                height={220}
                padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
                domainPadding={{ x: 20 }}
            >
                <VictoryAxis
                    tickValues={data.map((d) => d.day)}
                    style={{
                        axis: { stroke: Colors.grey200 },
                        tickLabels: {
                            fontSize: 10,
                            fill: Colors.grey500,
                            fontWeight: Typography.fontWeights.medium
                        },
                        grid: { stroke: 'transparent' }
                    }}
                />
                <VictoryAxis
                    dependentAxis
                    tickFormat={(x) => `₹${x / 1000}k`}
                    style={{
                        axis: { stroke: Colors.grey200 },
                        tickLabels: {
                            fontSize: 10,
                            fill: Colors.grey500,
                            fontWeight: Typography.fontWeights.medium
                        },
                        grid: { stroke: Colors.grey100, strokeDasharray: '4, 4' }
                    }}
                />
                <VictoryBar
                    data={data}
                    x="day"
                    y="revenue"
                    style={{
                        data: {
                            fill: Colors.primary,
                            width: 20,
                            borderRadius: 4,
                        },
                    }}
                    animate={{
                        duration: 500,
                        onLoad: { duration: 500 }
                    }}
                />
            </VictoryChart>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyContainer: {
        height: 200,
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        color: Colors.grey400,
        fontSize: Typography.fontSizes.sm,
        textAlign: 'center',
    },
});
