import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { tokens } from '../../theme/tokens';

interface Prediction {
  id: string;
  title: string;
  description: string;
  category: string;
  endDate: string;
  totalVolume: number;
  participants: number;
  status: 'open' | 'closed' | 'settled';
  yesPrice?: number;
  noPrice?: number;
  liquidity?: number;
  ticker?: string;
  marketType?: string;
}

interface MarketCardProps {
  prediction: Prediction;
  rank: number;
  onPress?: () => void;
}

export function MarketCard({ prediction, rank, onPress }: MarketCardProps) {
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(1)}K`;
    }
    return `$${volume}`;
  };

  const formatPrice = (price: number) => {
    return `$${(price / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return tokens.colors.success;
      case 'closed':
        return tokens.colors.warning;
      case 'settled':
        return tokens.colors.blue;
      default:
        return tokens.colors.color3;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'Expired';
    } else if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Tomorrow';
    } else if (diffDays < 7) {
      return `${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.rankContainer}>
        <Text style={styles.rank}>#{rank}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {prediction.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(prediction.status) }]}>
            <Text style={styles.statusText}>
              {prediction.status.charAt(0).toUpperCase() + prediction.status.slice(1)}
            </Text>
          </View>
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {prediction.description}
        </Text>
        
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Volume</Text>
            <Text style={styles.metaValue}>{formatVolume(prediction.totalVolume)}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Participants</Text>
            <Text style={styles.metaValue}>{prediction.participants}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Ends</Text>
            <Text style={styles.metaValue}>{formatDate(prediction.endDate)}</Text>
          </View>
        </View>

        {prediction.yesPrice !== undefined && prediction.noPrice !== undefined && (
          <View style={styles.pricing}>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>Yes</Text>
              <Text style={styles.priceValue}>{formatPrice(prediction.yesPrice)}</Text>
            </View>
            <View style={styles.priceItem}>
              <Text style={styles.priceLabel}>No</Text>
              <Text style={styles.priceValue}>{formatPrice(prediction.noPrice)}</Text>
            </View>
          </View>
        )}
        
        <View style={styles.categoryContainer}>
          <Text style={styles.category}>{prediction.category}</Text>
          {prediction.ticker && (
            <Text style={styles.ticker}>{prediction.ticker}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.surface,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: tokens.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rank: {
    fontSize: 20,
    fontWeight: '700',
    color: tokens.colors.blue,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.color,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    color: tokens.colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: tokens.colors.color2,
    marginBottom: 12,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 12,
    color: tokens.colors.color3,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: tokens.colors.color,
  },
  pricing: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: tokens.colors.surface2,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: tokens.colors.color3,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: tokens.colors.color,
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    fontSize: 12,
    color: tokens.colors.blue,
    backgroundColor: tokens.colors.blue + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: '600',
  },
  ticker: {
    fontSize: 10,
    color: tokens.colors.color3,
    fontFamily: 'monospace',
  },
});
