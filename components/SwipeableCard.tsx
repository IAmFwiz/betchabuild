import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { tokens } from '../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeableCardProps {
  prediction: {
    id: string;
    title: string;
    category: string;
    image_url?: string;
    yes_price: number;
    no_price: number;
    end_date: string;
  };
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onLike?: () => void;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  prediction,
  onSwipeLeft,
  onSwipeRight,
  onLike,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const [currentChoice, setCurrentChoice] = useState<'YES' | 'NO' | null>(null);
  const lastTap = useRef<number | null>(null);

  // Double tap handler for like
  const handleCardPress = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      // Double tap detected
      setIsLiked(!isLiked);
      onLike?.();
      // Animate heart
      Animated.sequence([
        Animated.timing(swipeIndicatorOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(swipeIndicatorOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
    lastTap.current = now;
  };

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const rotateAndTranslate = {
    transform: [
      { rotate },
      ...position.getTranslateTransform(),
    ],
  };

  const fadeInOutChoice = (choice: 'YES' | 'NO') => {
    setCurrentChoice(choice);
    Animated.sequence([
      Animated.timing(swipeIndicatorOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(swipeIndicatorOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => setCurrentChoice(null));
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Swipe right - YES
          fadeInOutChoice('YES');
          Animated.timing(position, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
            position.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          // Swipe left - NO
          fadeInOutChoice('NO');
          Animated.timing(position, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
            position.setValue({ x: 0, y: 0 });
          });
        } else {
          // Spring back to center
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // Fallback image if none provided or error
  const imageSource = prediction.image_url 
    ? { uri: prediction.image_url }
    : { uri: `https://kalshi.com/api/v2/markets/${prediction.id}/image` };

  return (
    <Animated.View
      style={[styles.card, rotateAndTranslate]}
      {...panResponder.panHandlers}
    >
      <TouchableWithoutFeedback onPress={handleCardPress}>
        <View style={styles.cardContent}>
          {/* Glossy overlay effect */}
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)', 'transparent']}
            style={styles.glossOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 0.5 }}
          />

          {/* Left red gradient - NO */}
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.3)', 'transparent']}
            style={styles.leftGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Right green gradient - YES */}
          <LinearGradient
            colors={['transparent', 'rgba(34, 197, 94, 0.3)']}
            style={styles.rightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Swipe indicator */}
          {currentChoice && (
            <Animated.View
              style={[
                styles.swipeIndicator,
                { opacity: swipeIndicatorOpacity },
              ]}
            >
              <Text
                style={[
                  styles.swipeIndicatorText,
                  { color: currentChoice === 'YES' ? '#22C55E' : '#EF4444' },
                ]}
              >
                {currentChoice}
              </Text>
              </Animated.View>
          )}

          {/* Main image */}
          <Image
            source={imageSource}
            style={styles.image}
            resizeMode="cover"
            defaultSource={{ uri: 'https://via.placeholder.com/400x600/1a1a1a/4FC3F7?text=Loading' }}
          />

          {/* Info boxes at bottom third */}
          <View style={styles.infoContainer}>
            <View style={styles.categoryBox}>
              <Text style={styles.categoryText}>{prediction.category}</Text>
            </View>
            
            <View style={styles.titleBox}>
              <Text style={styles.titleText} numberOfLines={3}>
                {prediction.title}
              </Text>
            </View>

            {/* Yes/No prices */}
            <View style={styles.priceContainer}>
              <View style={styles.priceBox}>
                <Text style={styles.yesText}>YES</Text>
                <Text style={styles.priceText}>{prediction.yes_price}%</Text>
              </View>
              <View style={styles.priceBox}>
                <Text style={styles.noText}>NO</Text>
                <Text style={styles.priceText}>{prediction.no_price}%</Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.65,
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.radius.xl,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  glossOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none',
  },
  leftGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '20%',
    zIndex: 5,
    pointerEvents: 'none',
  },
  rightGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '20%',
    zIndex: 5,
    pointerEvents: 'none',
  },
  swipeIndicator: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 20,
  },
  swipeIndicatorText: {
    fontSize: 48,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a1a1a',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '33%',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(10px)',
  },
  categoryBox: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radius.sm,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryText: {
    color: tokens.colors.background,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  titleBox: {
    marginBottom: 16,
  },
  titleText: {
    color: tokens.colors.color,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  yesText: {
    color: '#22C55E',
    fontSize: 24,
    fontWeight: 'bold',
  },
  noText: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
  priceText: {
    color: tokens.colors.color,
    fontSize: 24,
    fontWeight: '600',
  },
});

export default SwipeableCard;
