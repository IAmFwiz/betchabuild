import React, { useRef, useEffect } from 'react';
import {
  Animated,
  PanResponder,
  Dimensions,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { tokens } from '../../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 250;

interface Prediction {
  id: string;
  title: string;
  category: string;
  imageUri?: string;
  currentOdds: {
    yes: number;
    no: number;
  };
  volume: number;
  closesAt: string;
}

interface SwipeableCardProps {
  prediction: Prediction;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  isTopCard?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  prediction,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  isTopCard = false,
}) => {
  const position = useRef(new Animated.ValueXY()).current;
  const entryAnimation = useRef(new Animated.Value(0.9)).current;
  const swipeOverlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTopCard) {
      Animated.spring(entryAnimation, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }).start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [isTopCard, entryAnimation]);

  const rotation = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  const yesOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const noOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 4, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const nextCardScale = isTopCard
    ? entryAnimation
    : position.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: [1, 0.95, 1],
        extrapolate: 'clamp',
      });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else if (gesture.dy < -SWIPE_THRESHOLD / 2) {
          forceSwipe('up');
        } else if (gesture.dy > SWIPE_THRESHOLD / 2) {
          forceSwipe('down');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const forceSwipe = (direction: 'left' | 'right' | 'up' | 'down') => {
    const x = direction === 'right' ? SCREEN_WIDTH : direction === 'left' ? -SCREEN_WIDTH : 0;
    const y = direction === 'up' ? -SCREEN_HEIGHT : direction === 'down' ? SCREEN_HEIGHT : 0;

    Animated.timing(position, {
      toValue: { x, y },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: false,
    }).start(() => onSwipeComplete(direction));
  };

  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      useNativeDriver: false,
    }).start();
  };

  const onSwipeComplete = (direction: 'left' | 'right' | 'up' | 'down') => {
    position.setValue({ x: 0, y: 0 });
    Haptics.notificationAsync(
      direction === 'right' || direction === 'up'
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );

    switch (direction) {
      case 'left':
        onSwipeLeft?.();
        break;
      case 'right':
        onSwipeRight?.();
        break;
      case 'up':
        onSwipeUp?.();
        break;
      case 'down':
        onSwipeDown?.();
        break;
    }
  };

  if (!isTopCard) {
    return (
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale: nextCardScale }],
          },
        ]}
      >
        <CardContent prediction={prediction} />
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { rotate: rotation },
            ...position.getTranslateTransform(),
            { scale: entryAnimation },
          ],
        },
      ]}
      {...panResponder.panHandlers}
    >
      <CardContent prediction={prediction} />
      
      {/* YES overlay */}
      <Animated.View
        style={[
          styles.overlay,
          styles.yesOverlay,
          { opacity: yesOpacity },
        ]}
      >
        <Text style={styles.overlayText}>YES</Text>
      </Animated.View>

      {/* NO overlay */}
      <Animated.View
        style={[
          styles.overlay,
          styles.noOverlay,
          { opacity: noOpacity },
        ]}
      >
        <Text style={styles.overlayText}>NO</Text>
      </Animated.View>
    </Animated.View>
  );
};

interface CardContentProps {
  prediction: Prediction;
}

const CardContent: React.FC<CardContentProps> = ({ prediction }) => (
  <>
    <Image
      source={{ uri: prediction.imageUri }}
      style={styles.image}
      contentFit="cover"
    />
    
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.9)']}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {prediction.category?.toUpperCase() || 'OTHER'}
          </Text>
        </View>
        
        <Text style={styles.title}>{prediction.title}</Text>
        
        <View style={styles.oddsContainer}>
          <TouchableOpacity style={[styles.oddsButton, styles.noButton]}>
            <Text style={styles.buttonLabel}>NO</Text>
            <Text style={styles.oddsPercent}>{prediction.currentOdds?.no || 0}%</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.oddsButton, styles.yesButton]}>
            <Text style={styles.buttonLabel}>YES</Text>
            <Text style={styles.oddsPercent}>{prediction.currentOdds?.yes || 0}%</Text>
          </TouchableOpacity>
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
    </LinearGradient>
  </>
);

function formatVolume(volume: number): string {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
  return volume.toString();
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: 20,
    backgroundColor: tokens.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: tokens.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: tokens.colors.white,
    marginBottom: 20,
    lineHeight: 28,
  },
  oddsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  oddsButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  yesButton: {
    backgroundColor: tokens.colors.success,
  },
  noButton: {
    backgroundColor: tokens.colors.error,
  },
  buttonLabel: {
    color: tokens.colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  oddsPercent: {
    color: tokens.colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volumeText: {
    color: tokens.colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  closesText: {
    color: tokens.colors.white,
    fontSize: 14,
    opacity: 0.8,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 3,
  },
  yesOverlay: {
    right: 20,
    backgroundColor: tokens.colors.success,
    borderColor: tokens.colors.success,
  },
  noOverlay: {
    left: 20,
    backgroundColor: tokens.colors.error,
    borderColor: tokens.colors.error,
  },
  overlayText: {
    color: tokens.colors.white,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
