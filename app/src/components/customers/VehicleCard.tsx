import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
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
            color={selected ? Colors.primary : Colors.grey500} 
          />
        </View>
        {onDelete && (
          <TouchableOpacity onPress={() => onDelete(vehicle.id)} style={styles.deleteBtn}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.error} />
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
          <MaterialCommunityIcons name="check-circle" size={20} color={Colors.primary} />
        </View>
      )}
    </AppCard>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 160,
    marginRight: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: Colors.primary,
    backgroundColor: '#FFF1F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    padding: 4,
  },
  content: {
    marginTop: Spacing.xs,
  },
  model: {
    fontSize: Typography.fontSizes.base,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.dark,
  },
  selectedText: {
    color: Colors.primary,
  },
  details: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey500,
    marginTop: 2,
  },
  regBadge: {
    backgroundColor: Colors.grey100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  regText: {
    fontSize: 10,
    fontWeight: Typography.fontWeights.bold,
    color: Colors.grey600,
  },
  selectedBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: Colors.white,
    borderRadius: 10,
  },
});
