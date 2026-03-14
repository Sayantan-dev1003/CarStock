import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { AppCard } from '../common/AppCard';
import { Vehicle } from '../../types/customer.types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onDelete?: (id: string) => void;
  selected?: boolean;
  onPress?: (id: string) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onDelete,
  selected,
  onPress,
}) => {
  return (
    <AppCard 
      onPress={onPress ? () => onPress(vehicle.id) : undefined} 
      style={[
        styles.card,
        selected && styles.selectedCard
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="car" 
            size={24} 
            color={selected ? theme.colors.primary : theme.colors.textMuted} 
          />
        </View>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(vehicle.id)} style={styles.deleteBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.model, selected && styles.selectedText]} numberOfLines={1}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text style={styles.details}>{vehicle.year} • {vehicle.fuelType}</Text>
        {vehicle.regNumber && (
          <View style={styles.regBadge}>
            <Text style={styles.regText}>{vehicle.regNumber.toUpperCase()}</Text>
          </View>
        )}
      </View>
      
      {selected && (
        <View style={styles.selectedBadge}>
          <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: theme.spacing.md,
    padding: theme.spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 4,
  },
  content: {
    marginTop: theme.spacing.xs,
  },
  model: {
    fontSize: 15,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
  },
  selectedText: {
    color: theme.colors.primary,
  },
  details: {
    fontSize: 12,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  regBadge: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  regText: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.bgCard,
    borderRadius: 10,
  },
});
