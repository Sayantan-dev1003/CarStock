import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { CustomerVehicle } from '../../types/customer.types';

interface VehicleCardProps {
    vehicle: CustomerVehicle;
    onDelete?: () => void;
    selected?: boolean;
    onPress?: () => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
    vehicle,
    onDelete,
    selected,
    onPress,
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                selected && styles.selectedContainer,
            ]}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <MaterialCommunityIcons
                    name="car"
                    size={24}
                    color={selected ? Colors.primary : Colors.grey500}
                />
                {onDelete && (
                    <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
                        <MaterialCommunityIcons name="close" size={16} color={Colors.error} />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={[styles.name, selected && styles.selectedText]}>
                {vehicle.make} {vehicle.model}
            </Text>
            <Text style={styles.year}>{vehicle.year} • {vehicle.fuelType}</Text>

            {vehicle.regNumber && (
                <View style={styles.regContainer}>
                    <Text style={styles.regText}>{vehicle.regNumber}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 140,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.white,
        borderWidth: 1,
        borderColor: Colors.grey200,
        marginRight: Spacing.md,
    },
    selectedContainer: {
        borderColor: Colors.primary,
        backgroundColor: '#FFF1F2',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    deleteBtn: {
        padding: 2,
    },
    name: {
        fontSize: Typography.fontSizes.sm,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: 2,
    },
    selectedText: {
        color: Colors.primary,
    },
    year: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey500,
        marginBottom: Spacing.sm,
    },
    regContainer: {
        backgroundColor: Colors.grey100,
        paddingHorizontal: Spacing.xs,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    regText: {
        fontSize: 10,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.grey600,
        textTransform: 'uppercase',
    },
});
