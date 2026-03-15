import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '../../constants/theme';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  style?: StyleProp<ViewStyle>;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { text: theme.colors.success, bg: theme.colors.success + '15' };
      case 'warning':
        return { text: theme.colors.warning, bg: theme.colors.warning + '15' };
      case 'error':
        return { text: theme.colors.error, bg: theme.colors.error + '15' };
      case 'info':
        return { text: theme.colors.primary, bg: theme.colors.primaryLight };
      default:
        return { text: theme.colors.textSecondary, bg: theme.colors.bgMuted };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.primary }, style]}>
      <Text style={[styles.text, { color: theme.colors.bgCard }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontFamily: theme.font.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
