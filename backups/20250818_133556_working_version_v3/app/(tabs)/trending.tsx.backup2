import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useKalshiStore } from '../../store/kalshiStore';
import { MarketCard } from '../../components/features/MarketCard';
import { tokens } from '../../theme/tokens';

export default function TrendingScreen() {
  const { trendingPredictions, loading, error, fetchTrending, fetchByCategory } = useKalshiStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchTrending();
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchTrending();
    setRefreshing(false);
  }, []);

  const categories = ['all', 'sports', 'politics', 'finance', 'entertainment', 'music', 'general'];
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      await fetchTrending();
    } else {
      await fetchByCategory(category);
    }
  };

  if (loading && trendingPredictions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Trending</Text>
          <Text style={styles.subtitle}>Most popular predictions right now</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tokens.colors.blue} />
          <Text style={styles.loadingText}>Loading trending predictions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending</Text>
        <Text style={styles.subtitle}>Most popular predictions right now</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryPill,
              selectedCategory === category && styles.categoryPillActive
            ]}
            onPress={() => handleCategorySelect(category)}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive
            ]}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchTrending}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={tokens.colors.blue}
          />
        }
      >
        {trendingPredictions.map((prediction, index) => (
          <MarketCard
            key={prediction.id}
            prediction={prediction}
            rank={index + 1}
          />
        ))}

        {trendingPredictions.length === 0 && !loading && !error && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No trending predictions found</Text>
            <Text style={styles.emptySubtext}>Try selecting a different category</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: tokens.colors.color,
  },
  subtitle: {
    fontSize: 16,
    color: tokens.colors.color3,
    marginTop: 4,
  },
  categoryScroll: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: tokens.colors.blue,
  },
  categoryText: {
    color: tokens.colors.color2,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: tokens.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: tokens.colors.color2,
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: tokens.colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: tokens.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: tokens.colors.color3,
    fontSize: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: tokens.colors.color3,
    fontSize: 14,
    textAlign: 'center',
  },
});
