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
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name="car" 
            size={24} 
            color={selected ? theme.colors.primary : theme.colors.textMuted} 
          />
        </View>
        
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={[styles.model, selected && styles.selectedText]} numberOfLines={1}>
              {vehicle.make} {vehicle.model}
            </Text>
            {onDelete && (
              <TouchableOpacity onPress={() => onDelete(vehicle.id)} style={styles.deleteBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.detailsRow}>
            <Text style={styles.details}>{vehicle.year} • {vehicle.fuelType}</Text>
            {vehicle.regNumber && (
              <View style={styles.regBadge}>
                <Text style={styles.regText}>{vehicle.regNumber.toUpperCase()}</Text>
              </View>
            )}
          </View>
        </View>

        {selected && (
          <View style={styles.selectedIndicator}>
            <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
          </View>
        )}
      </View>
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgCard,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  model: {
    fontSize: 16,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  selectedText: {
    color: theme.colors.primary,
  },
  details: {
    fontSize: 13,
    fontFamily: theme.font.body,
    color: theme.colors.textSecondary,
  },
  deleteBtn: {
    padding: 8,
    marginLeft: 8,
  },
  regBadge: {
    backgroundColor: theme.colors.bgMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginLeft: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  regText: {
    fontSize: 10,
    fontFamily: theme.font.bodyBold,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  selectedIndicator: {
    marginLeft: theme.spacing.sm,
  },
});
