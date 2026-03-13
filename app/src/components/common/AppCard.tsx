import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Shadows, BorderRadius, Spacing } from '../../constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined';
  style?: ViewStyle;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.9}
      onPress={onPress}
      style={[
        styles.card,
        variant === 'elevated' ? Shadows.md : styles.outlined,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
});
