import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FAB } from 'react-native-paper';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { customersApi } from '../../../src/api/customers.api';
import { CustomerCard } from '../../../src/components/customers/CustomerCard';
import { AppInput } from '../../../src/components/common/AppInput';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { useDebounce } from '../../../src/hooks/useDebounce';

const TAGS = ['ALL', 'REGULAR', 'VIP', 'NEW'];

export default function CustomersScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [selectedTag, setSelectedTag] = useState('ALL');

    const debouncedSearch = useDebounce(search, 500);

    const {
        data: customersData,
        isLoading,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ['customers', debouncedSearch, page],
        queryFn: () => customersApi.getCustomers({
            page,
            limit: 20,
            search: debouncedSearch,
        }),
    });

    // Client-side filtering for tags if API doesn't support it directly in query?
    // Looking at customersApi, it only has search. Better to filter locally or assume search handles it.
    // For now, let's just search and display.

    const renderHeader = () => (
        <View style={styles.header}>
            <Text style={styles.title}>Customers</Text>
            <AppInput
                label=""
                placeholder="Search by name or mobile..."
                value={search}
                onChangeText={setSearch}
                leftIcon="magnify"
                containerStyle={styles.searchBar}
            />
            <View style={styles.tagContainer}>
                {TAGS.map((tag) => (
                    <TouchableOpacity
                        key={tag}
                        style={[
                            styles.tagChip,
                            selectedTag === tag && styles.tagChipActive,
                        ]}
                        onPress={() => setSelectedTag(tag)}
                    >
                        <Text style={[
                            styles.tagText,
                            selectedTag === tag && styles.tagTextActive
                        ]}>{tag}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const filteredData = customersData?.data.filter(c =>
        selectedTag === 'ALL' || c.tag === selectedTag
    ) || [];

    return (
        <View style={styles.container}>
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CustomerCard
                        customer={item}
                        onPress={(c) => router.push({
                            pathname: '/(app)/customers/customer-detail',
                            params: { id: c.id }
                        })}
                    />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={Colors.primary} />
                }
                ListEmptyComponent={
                    isLoading ? <LoadingSpinner /> : (
                        <EmptyState
                            icon="account-search-outline"
                            title="No customers found"
                            subtitle="Try a different search term"
                        />
                    )
                }
            />

            <FAB
                icon="account-plus"
                style={styles.fab}
                color={Colors.white}
                onPress={() => {
                    // For simplicity, we could reuse a specialized modal or 
                    // go to billing flow which handles creation
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.screenBg,
    },
    listContent: {
        paddingBottom: 100,
    },
    header: {
        padding: Spacing.lg,
        backgroundColor: Colors.white,
        marginBottom: Spacing.md,
        ...Shadows.sm,
    },
    title: {
        fontSize: Typography.fontSizes.xl,
        fontWeight: Typography.fontWeights.bold,
        color: Colors.dark,
        marginBottom: Spacing.md,
    },
    searchBar: {
        marginBottom: Spacing.md,
    },
    tagContainer: {
        flexDirection: 'row',
    },
    tagChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.grey100,
        marginRight: Spacing.sm,
    },
    tagChipActive: {
        backgroundColor: Colors.primary,
    },
    tagText: {
        fontSize: 12,
        color: Colors.grey600,
        fontWeight: Typography.fontWeights.medium,
    },
    tagTextActive: {
        color: Colors.white,
        fontWeight: Typography.fontWeights.bold,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
        backgroundColor: Colors.primary,
    },
});
