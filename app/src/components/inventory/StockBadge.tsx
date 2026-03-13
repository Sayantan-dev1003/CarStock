import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface StockBadgeProps {
  quantity: number;
  reorderLevel: number;
}

export const StockBadge: React.FC<StockBadgeProps> = ({ quantity, reorderLevel }) => {
  let backgroundColor = Colors.successLight;
  let textColor = Colors.success;
  let label = 'In Stock';

  if (quantity === 0) {
    backgroundColor = Colors.errorLight;
    textColor = Colors.error;
    label = 'Out of Stock';
  } else if (quantity <= reorderLevel) {
    backgroundColor = Colors.warningLight;
    textColor = Colors.warning;
    label = 'Low Stock';
  }

  return (
    <View style={[styles.badge, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: Typography.fontWeights.bold,
    textTransform: 'uppercase',
  },
});
