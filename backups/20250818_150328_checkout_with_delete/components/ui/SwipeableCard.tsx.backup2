import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { AppPrediction } from '../../lib/kalshi/transformer';
import { tokens } from '../../theme/tokens';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeableCardProps {
  prediction: AppPrediction;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  isTopCard: boolean;
}

export function SwipeableCard({
  prediction,
  onSwipeRight,
  onSwipeLeft,
  onSwipeUp,
  onSwipeDown,
  isTopCard,
}: SwipeableCardProps) {
  return (
    <View style={[styles.card, isTopCard && styles.topCard]}>
      <Image source={{ uri: prediction.imageUri }} style={styles.image} />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.category}>{prediction.category.toUpperCase()}</Text>
          <Text style={styles.closesAt}>{prediction.closesAt}</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{prediction.title}</Text>
          <Text style={styles.description}>{prediction.description}</Text>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.oddsContainer}>
            <View style={styles.oddsItem}>
              <Text style={styles.oddsLabel}>YES</Text>
              <Text style={styles.oddsValue}>{prediction.currentOdds.yes}¢</Text>
            </View>
            <View style={styles.oddsItem}>
              <Text style={styles.oddsLabel}>NO</Text>
              <Text style={styles.oddsValue}>{prediction.currentOdds.no}¢</Text>
            </View>
          </View>
          
          <View style={styles.stats}>
            <Text style={styles.volume}>📊 {prediction.volume.toLocaleString()}</Text>
            {prediction.trending && <Text style={styles.trending}>🔥 Trending</Text>}
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={[styles.actionButton, styles.noButton]} onPress={onSwipeLeft}>
              <Text style={styles.buttonText}>NO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.skipButton} onPress={onSwipeUp}>
              <Text style={styles.skipText}>SKIP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.yesButton]} onPress={onSwipeRight}>
              <Text style={styles.buttonText}>YES</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: screenWidth - 40,
    height: screenWidth * 1.2,
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  topCard: {
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  category: {
    color: tokens.colors.blue,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closesAt: {
    color: tokens.colors.color3,
    fontSize: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: tokens.colors.color,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    color: tokens.colors.color2,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    gap: 16,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  oddsItem: {
    alignItems: 'center',
  },
  oddsLabel: {
    color: tokens.colors.color3,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  oddsValue: {
    color: tokens.colors.color,
    fontSize: 18,
    fontWeight: '700',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volume: {
    color: tokens.colors.color2,
    fontSize: 12,
  },
  trending: {
    color: tokens.colors.gold,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yesButton: {
    backgroundColor: tokens.colors.blue,
  },
  noButton: {
    backgroundColor: tokens.colors.red,
  },
  skipButton: {
    backgroundColor: tokens.colors.surface2,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  buttonText: {
    color: tokens.colors.background,
    fontSize: 16,
    fontWeight: '700',
  },
  skipText: {
    color: tokens.colors.color3,
    fontSize: 14,
    fontWeight: '600',
  },
});
