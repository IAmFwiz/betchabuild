import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';
import { AppPrediction } from '../../lib/kalshi/transformer';
import { tokens } from '../../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GlossyCardProps {
  prediction: AppPrediction;
  onYesPress?: () => void;
  onNoPress?: () => void;
}

export const GlossyCard = ({ prediction, onYesPress, onNoPress }: GlossyCardProps) => {
  const shimmerPosition = useSharedValue(-1);

  useEffect(() => {
    shimmerPosition.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerPosition.value * 200 }],
  }));

  return (
    <View style={styles.cardContainer}>
      <Image source={{ uri: prediction.imageUri }} style={styles.cardImage} />
      
      {/* Shimmer overlay */}
      <Animated.View style={[styles.shimmer, shimmerStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>

      {/* Top category badge */}
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{prediction.category.toUpperCase()}</Text>
      </View>

      {/* Bottom gradient with content */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
        style={styles.bottomGradient}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={2}>{prediction.title}</Text>
          
          <View style={styles.metaInfo}>
            <Text style={styles.closesAt}>⏰ {prediction.closesAt}</Text>
            <Text style={styles.volume}>📊 {prediction.volume.toLocaleString()}</Text>
            {prediction.trending && <Text style={styles.trending}>🔥 Trending</Text>}
          </View>

          <View style={styles.oddsContainer}>
            <TouchableOpacity 
              style={[styles.oddsButton, styles.yesButton]}
              onPress={onYesPress}
            >
              <Text style={styles.oddsText}>YES</Text>
              <Text style={styles.percentText}>{prediction.currentOdds.yes}¢</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.oddsButton, styles.noButton]}
              onPress={onNoPress}
            >
              <Text style={styles.oddsText}>NO</Text>
              <Text style={styles.percentText}>{prediction.currentOdds.no}¢</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH * 1.2,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: tokens.colors.surface,
    ...tokens.shadows.elevation,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  shimmerGradient: {
    width: 200,
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 2,
  },
  categoryText: {
    color: tokens.colors.blue,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 2,
  },
  contentContainer: {
    gap: 12,
  },
  title: {
    color: tokens.colors.color,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  closesAt: {
    color: tokens.colors.color2,
    fontSize: 12,
    fontWeight: '500',
  },
  volume: {
    color: tokens.colors.color2,
    fontSize: 12,
    fontWeight: '500',
  },
  trending: {
    color: tokens.colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  oddsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  oddsButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadows.sm,
  },
  yesButton: {
    backgroundColor: tokens.colors.blue,
  },
  noButton: {
    backgroundColor: tokens.colors.red,
  },
  oddsText: {
    color: tokens.colors.background,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  percentText: {
    color: tokens.colors.background,
    fontSize: 16,
    fontWeight: '800',
  },
});
