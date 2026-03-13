import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../../../src/constants/theme';
import { customersApi } from '../../../src/api/customers.api';
import { CustomerCard } from '../../../src/components/customers/CustomerCard';
import { LoadingSpinner } from '../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../src/components/common/EmptyState';
import { AppInput } from '../../../src/components/common/AppInput';

const TAGS = ['ALL', 'REGULAR', 'VIP', 'NEW', 'INACTIVE'];

export default function CustomersScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('ALL');

  const { 
    data: customers, 
    isLoading, 
    refetch,
    isRefetching 
  } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getCustomers(1, 100),
  });

  const filteredCustomers = useMemo(() => {
    return (customers?.data || []).filter((c: any) => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                           c.mobile.includes(search);
      const matchesTag = selectedTag === 'ALL' || c.tag === selectedTag;
      return matchesSearch && matchesTag;
    });
  }, [customers, search, selectedTag]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <AppInput
          placeholder="Search customers by name or mobile..."
          value={search}
          onChangeText={setSearch}
          leftIcon="account-search"
          containerStyle={styles.searchBar}
        />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterBar}
          contentContainerStyle={styles.filterContent}
        >
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.filterChip,
                selectedTag === tag && styles.activeFilterChip
              ]}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={[
                styles.filterChipText,
                selectedTag === tag && styles.activeFilterChipText
              ]}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onPress={(c) => router.push(`/(app)/customers/${c.id}`)}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[Colors.primary]} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="account-outline"
            title="No customers found"
            subtitle="Start by creating a new bill or customer profile"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.screenBg,
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.sm,
    ...Shadows.sm,
  },
  searchBar: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  filterBar: {
    paddingBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.base,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.offWhite,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.grey200,
  },
  activeFilterChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.grey600,
    fontWeight: Typography.fontWeights.medium,
  },
  activeFilterChipText: {
    color: Colors.white,
  },
  listContent: {
    padding: Spacing.base,
  },
});
