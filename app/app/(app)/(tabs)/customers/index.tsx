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
import { useTheme } from '../../../../src/context/ThemeContext';
import { customersApi } from '../../../../src/api/customers.api';
import { CustomerCard } from '../../../../src/components/customers/CustomerCard';
import { LoadingSpinner } from '../../../../src/components/common/LoadingSpinner';
import { EmptyState } from '../../../../src/components/common/EmptyState';
import { AppHeader } from '../../../../src/components/common/AppHeader';
import { MetricCard } from '../../../../src/components/dashboard/MetricCard';

const TAGS = ['ALL', 'REGULAR', 'VIP', 'NEW', 'INACTIVE'];

export default function CustomersScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
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

  const stats = useMemo(() => {
    const data = customers?.data || [];
    return {
      total: data.length,
      vip: data.filter((c: any) => c.tag === 'VIP').length,
      new: data.filter((c: any) => c.tag === 'NEW').length,
    };
  }, [customers]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <AppHeader 
        title="Customers" 
        subtitle="Manage your customer relationships"
        rightAction={{
          icon: 'person-add-outline',
          onPress: () => router.push('/(app)/customers/add'),
        }}
      />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textMuted} style={styles.searchIcon} />
            <TextInput
              placeholder="Search customers..."
              placeholderTextColor={theme.colors.textMuted}
              value={search}
              onChangeText={setSearch}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricsRow}>
            <MetricCard
              title="Total"
              value={stats.total}
              icon="people-outline"
              variant="primary"
            />
            <MetricCard
              title="VIP"
              value={stats.vip}
              icon="star-outline"
            />
            <MetricCard
              title="New"
              value={stats.new}
              icon="person-outline"
            />
          </View>
        </View>

        {/* Tags Filter */}
        <View style={styles.filterSection}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
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
                  activeOpacity={0.7}
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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={isRefetching} 
              onRefresh={refetch} 
              colors={[theme.colors.primary]} 
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No customers found"
              subtitle="Start by creating a new bill or customer profile"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

function createStyles(theme: any) {
  return StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    flex: 1,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.bgCard,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.sm,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: theme.font.body,
    color: theme.colors.textPrimary,
  },
  metricsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  activeFilterPill: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  inactiveFilterPill: {
    backgroundColor: theme.colors.bgCard,
    borderColor: theme.colors.border,
  },
  filterText: {
    fontSize: 13,
    fontFamily: theme.font.bodySemiBold,
  },
  activeFilterText: {
    color: theme.colors.bgCard,
  },
  inactiveFilterText: {
    color: theme.colors.textSecondary,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
});


}
