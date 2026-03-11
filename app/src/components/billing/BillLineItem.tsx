import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { BillItem } from '../../types/billing.types';

interface BillLineItemProps {
    item: BillItem;
    onQuantityChange: (qty: number) => void;
    onRemove: () => void;
}

export const BillLineItem: React.FC<BillLineItemProps> = ({
    item,
    onQuantityChange,
    onRemove,
}) => {
    const renderRightActions = () => (
        <TouchableOpacity style={styles.deleteAction} onPress={onRemove}>
            <MaterialCommunityIcons name="trash-can-outline" size={24} color={Colors.white} />
        </TouchableOpacity>
    );

    return (
        <Swipeable renderRightActions={renderRightActions}>
            <View style={styles.container}>
                <View style={styles.info}>
                    <Text style={styles.name}>{item.productName}</Text>
                    <Text style={styles.price}>₹{item.unitPrice} / unit</Text>
                </View>

                <View style={styles.rightSection}>
                    <View style={styles.quantityContainer}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => item.quantity > 1 ? onQuantityChange(item.quantity - 1) : onRemove()}
                        >
                            <MaterialCommunityIcons
                                name={item.quantity > 1 ? "minus" : "trash-can-outline"}
                                size={18}
                                color={Colors.primary}
                            />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => onQuantityChange(item.quantity + 1)}
                        >
                            <MaterialCommunityIcons name="plus" size={18} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.totalText}>₹{item.unitPrice * item.quantity}</Text>
                </View>
            </View>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.white,
        borderBottomWidth: 1,
        borderBottomColor: Colors.grey100,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    price: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey500,
    },
    rightSection: {
        alignItems: 'flex-end',
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.grey100,
        borderRadius: BorderRadius.sm,
        padding: 2,
        marginBottom: Spacing.xs,
    },
    qtyBtn: {
        padding: Spacing.xs,
    },
    qtyText: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        marginHorizontal: Spacing.md,
        minWidth: 20,
        textAlign: 'center',
    },
    totalText: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.primary,
    },
    deleteAction: {
        backgroundColor: Colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
    },
});
