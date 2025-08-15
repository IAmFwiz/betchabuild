import React, { useRef, useEffect } from 'react';
import { Animated, PanResponder, Dimensions, View, Text, StyleSheet, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppPrediction } from '../../lib/kalshi/transformer';
import { tokens } from '../../theme/tokens';

const SWIPE_THRESHOLD = 120;
const SWIPE_OUT_DURATION = 250;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeableCardProps {
  prediction: AppPrediction;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  isTopCard: boolean;
}

export const SwipeableCard = ({ 
  prediction, 
  onSwipeLeft, 
  onSwipeRight, 
  onSwipeUp, 
  onSwipeDown,
  isTopCard 
}: SwipeableCardProps) => {
  const position = useRef(new Animated.ValueXY()).current;
  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else if (gesture.dy < -50) {
          forceSwipe('up');
        } else if (gesture.dy > 50) {
          forceSwipe('down');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: string) => {
    const x = direction === 'right' ? SCREEN_WIDTH : direction === 'left' ? -SCREEN_WIDTH : 0;
    const y = direction === 'up' ? -500 : direction === 'down' ? 500 : 0;
    
    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  };

  const onSwipeComplete = (direction: string) => {
    position.setValue({ x: 0, y: 0 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    switch(direction) {
      case 'left': onSwipeLeft(); break;
      case 'right': onSwipeRight(); break;
      case 'up': onSwipeUp(); break;
      case 'down': onSwipeDown(); break;
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { rotate: rotation },
            ...position.getTranslateTransform(),
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.cardContent}>
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
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
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
});
