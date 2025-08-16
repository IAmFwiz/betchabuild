import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { tokens } from '../../theme/tokens';
import * as Haptics from 'expo-haptics';

interface Prediction {
  id: string;
  title: string;
  category: string;
  imageUri?: string;
  trending?: boolean;
  currentOdds: {
    yes: number;
    no: number;
  };
  volume: number;
  closesAt: string;
}

interface MarketCardProps {
  prediction: Prediction;
  rank?: number;
  onPress?: (prediction: Prediction) => void;
}

export const MarketCard: React.FC<MarketCardProps> = ({ prediction, rank, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(prediction);
  };

  // Safety check for required properties
  if (!prediction || !prediction.title || !prediction.currentOdds) {
    return null;
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {rank && (
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{rank}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        {prediction.imageUri && (
          <Image 
            source={{ uri: prediction.imageUri }} 
            style={styles.thumbnail}
            contentFit="cover"
          />
        )}
        
        <View style={styles.info}>
          <View style={styles.header}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(prediction.category) }]}>
              <Text style={styles.categoryText}>{prediction.category?.toUpperCase() || 'OTHER'}</Text>
            </View>
            {prediction.trending && (
              <Text style={styles.trendingBadge}>🔥 HOT</Text>
            )}
          </View>
          
          <Text style={styles.title} numberOfLines={2}>{prediction.title}</Text>
          
          <View style={styles.oddsContainer}>
            <View style={styles.oddsBar}>
              <LinearGradient
                colors={['#4FC3F7', '#2DA9E0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.oddsProgress, { width: `${prediction.currentOdds.yes || 0}%` }]}
              />
            </View>
            <View style={styles.oddsLabels}>
              <Text style={[styles.oddsText, { color: tokens.colors.blue }]}>
                YES {prediction.currentOdds.yes || 0}%
              </Text>
              <Text style={[styles.oddsText, { color: tokens.colors.red }]}>
                NO {prediction.currentOdds.no || 0}%
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.volumeText}>
              {formatVolume(prediction.volume || 0)} trades
            </Text>
            <Text style={styles.closesText}>
              Closes {prediction.closesAt || 'Unknown'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

function getCategoryColor(category: string): string {
  const colors = {
    sports: tokens.colors.blue,
    music: tokens.colors.purple,
    movies: tokens.colors.gold,
    viral: tokens.colors.blueStrong,
    other: tokens.colors.surface2,
  };
  return colors[category as keyof typeof colors] || colors.other;
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toString();
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rankBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: tokens.colors.primary,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  rankText: {
    color: tokens.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flexDirection: 'row',
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    color: tokens.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  trendingBadge: {
    backgroundColor: tokens.colors.red,
    color: tokens.colors.white,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  oddsContainer: {
    marginBottom: 12,
  },
  oddsBar: {
    height: 8,
    backgroundColor: tokens.colors.surface2,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  oddsProgress: {
    height: '100%',
    borderRadius: 4,
  },
  oddsLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  oddsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
  closesText: {
    fontSize: 12,
    color: tokens.colors.textSecondary,
  },
});
