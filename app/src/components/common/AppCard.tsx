import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { theme } from '../../constants/theme';

interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined';
  style?: StyleProp<ViewStyle>;
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
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        variant === 'elevated' ? theme.shadow.card : styles.outlined,
        style,
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    padding: theme.spacing.md,
    marginVertical: 4,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
});
