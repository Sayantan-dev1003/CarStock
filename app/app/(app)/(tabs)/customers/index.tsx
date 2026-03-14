import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { theme } from '../../../../src/constants/theme';
import { customersApi } from '../../../../src/api/customers.api';
import { CustomerCard } from '../../../../src/components/customers/CustomerCard';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { AppHeader } from '../../../../src/components/common/AppHeader';

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
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader 
        title="Customers" 
        subtitle="Manage your customer relationships"
      />
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#A8A29E" style={styles.searchIcon} />
          <TextInput
            placeholder="Search customers..."
            placeholderTextColor="#A8A29E"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterBar}
          contentContainerStyle={styles.filterContent}
        >
          {TAGS.map((tag) => {
            const isActive = selectedTag === tag;
            return (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.filterPill,
                  isActive ? styles.activeFilterPill : styles.inactiveFilterPill
                ]}
                onPress={() => setSelectedTag(tag)}
              >
                <Text style={[
                  styles.filterText,
                  isActive ? styles.activeFilterText : styles.inactiveFilterText
                ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
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
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={['#B45309']} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No customers found"
            subtitle="Start by creating a new bill or customer profile"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: theme.radius.full,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.font.body,
    color: theme.colors.textPrimary,
  },
  filterBar: {
    marginBottom: 16,
  },
  filterContent: {
    paddingRight: 20,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
  },
  activeFilterPill: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  inactiveFilterPill: {
    backgroundColor: theme.colors.bgMuted,
    borderColor: 'transparent',
  },
  filterText: {
    fontSize: 13,
    fontFamily: theme.font.bodyMedium,
  },
  activeFilterText: {
    color: theme.colors.primary,
  },
  inactiveFilterText: {
    color: theme.colors.textMuted,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});

