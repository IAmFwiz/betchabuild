import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, RefreshControl } from 'react-native';
import { useKalshiStore } from '../../store/kalshiStore';
import { MarketCard } from '../../components/features/MarketCard';
import { tokens } from '../../theme/tokens';

export default function TrendingScreen() {
  const { trendingPredictions, loading, fetchTrending } = useKalshiStore();
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrending().catch(err => {
      setError(err.message);
      console.error('Trending fetch error:', err);
    });
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTrending();
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Trending refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const categories = ['all', 'sports', 'music', 'movies', 'viral'];
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredPredictions = selectedCategory === 'all' 
    ? trendingPredictions 
    : trendingPredictions.filter(p => p.category === selectedCategory);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>Failed to load trending</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              fetchTrending().catch(err => {
                setError(err.message);
                console.error('Trending retry error:', err);
              });
            }}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
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
            onPress={() => setSelectedCategory(category)}
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

      <ScrollView 
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={tokens.colors.blue} 
          />
        }
        style={styles.predictionsList}
      >
        {filteredPredictions?.map((prediction, index) => (
          <MarketCard
            key={`${prediction.id}-${index}`}
            prediction={prediction}
            rank={index + 1}
          />
        ))}
        
        {filteredPredictions.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyText}>No trending predictions</Text>
            <Text style={styles.emptySubtext}>Check back soon for new markets</Text>
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
    fontSize: tokens.typography.sizes.xxxl,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.color,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.md,
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
    borderRadius: tokens.radius.pill,
    marginRight: 8,
  },
  categoryPillActive: {
    backgroundColor: tokens.colors.blue,
  },
  categoryText: {
    color: tokens.colors.color2,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.semibold,
  },
  categoryTextActive: {
    color: tokens.colors.background,
  },
  predictionsList: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: tokens.colors.error,
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    color: tokens.colors.color3,
    fontSize: tokens.typography.sizes.md,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: tokens.colors.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: tokens.radius.pill,
  },
  retryText: {
    color: tokens.colors.background,
    fontWeight: tokens.typography.weights.bold,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: tokens.colors.color3,
    fontSize: tokens.typography.sizes.md,
    textAlign: 'center',
  },
  emptySubtext: {
    color: tokens.colors.color3,
    fontSize: tokens.typography.sizes.sm,
    textAlign: 'center',
    marginTop: 8,
  },
});
