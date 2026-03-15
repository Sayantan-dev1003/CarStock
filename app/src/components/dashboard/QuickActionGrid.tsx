import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';

interface ActionItem {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const ACTIONS: ActionItem[] = [
  { label: 'New Bill', icon: 'add-circle-outline', route: '/(app)/(tabs)/billing' },
  { label: 'Add Product', icon: 'cube-outline', route: '/(app)/inventory/add-product' },
  { label: 'Add Customer', icon: 'person-add-outline', route: '/(app)/(tabs)/customers' },
  { label: 'Inventory', icon: 'list-outline', route: '/(app)/(tabs)/inventory' },
];

export const QuickActionGrid: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();

  return (
    <View style={styles.grid}>
      {ACTIONS.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionCard}
          onPress={() => router.push(action.route as any)}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <Ionicons name={action.icon} size={24} color={theme.colors.primary} />
          </View>
          <Text style={styles.label}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

function createStyles(theme: any) {
  return StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%', // 2 per row
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.md,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontFamily: theme.font.bodySemiBold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});

}
