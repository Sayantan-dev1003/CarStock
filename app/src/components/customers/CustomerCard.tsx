import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AppCard } from '../common/AppCard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { Customer } from '../../types/customer.types';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBadge } from '../common/StatusBadge';

interface CustomerCardProps {
    customer: Customer;
    onPress: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onPress }) => {
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const getTagColor = (tag: string) => {
        switch (tag) {
            case 'VIP': return '#F59E0B';
            case 'REGULAR': return Colors.grey500;
            case 'INACTIVE': return Colors.grey300;
            default: return Colors.grey500;
        }
    };

    return (
        <TouchableOpacity onPress={() => onPress(customer)} activeOpacity={0.7}>
            <AppCard style={styles.container}>
                <View style={styles.row}>
                    <View style={[styles.avatar, { backgroundColor: getTagColor(customer.tag) }]}>
                        <Text style={styles.avatarText}>{getInitials(customer.name)}</Text>
                    </View>
                    <View style={styles.info}>
                        <View style={styles.nameRow}>
                            <Text style={styles.name}>{customer.name}</Text>
                            <StatusBadge
                                status={customer.tag}
                                text={customer.tag}
                                size="sm"
                            />
                        </View>
                        <Text style={styles.mobile}>{customer.mobile}</Text>
                        <View style={styles.statsRow}>
                            <Text style={styles.statsText}>₹{customer.totalSpend.toLocaleString()} spent</Text>
                            <Text style={styles.statsDot}> • </Text>
                            <Text style={styles.statsText}>{customer.billCount} bills</Text>
                        </View>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color={Colors.grey400} />
                </View>
            </AppCard>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    avatarText: {
        color: Colors.white,
        fontWeight: Typography.fontWeights.bold,
        fontSize: Typography.fontSizes.base,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    name: {
        fontSize: Typography.fontSizes.base,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
    },
    mobile: {
        fontSize: Typography.fontSizes.sm,
        color: Colors.grey500,
        marginBottom: 4,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statsText: {
        fontSize: Typography.fontSizes.xs,
        color: Colors.grey400,
    },
    statsDot: {
        color: Colors.grey300,
    },
});
