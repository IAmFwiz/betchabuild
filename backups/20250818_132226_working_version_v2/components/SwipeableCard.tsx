// components/SwipeableCard.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { tokens } from '../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Prediction {
  id: string;
  title: string;
  category: string;
  image_url?: string;
  yes_price: number;
  no_price: number;
  end_date: string;
}

interface SwipeableCardProps {
  prediction: Prediction;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
  onSwipeDown: () => void;
  onLike?: () => void;
  isTop: boolean;
}

const SwipeableCard: React.FC<SwipeableCardProps> = ({
  prediction,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  isTop,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Create shimmer animation for glossy effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnimation, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnimation, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  const yesOpacity = pan.x.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const noOpacity = pan.x.interpolate({
    inputRange: [-150, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const skipOpacity = pan.y.interpolate({
    inputRange: [-150, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const shimmerTranslate = shimmerAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 2, SCREEN_WIDTH * 2],
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > 120) {
          // Swipe right - YES
          Animated.spring(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -120) {
          // Swipe left - NO
          Animated.spring(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gestureState.dy },
            useNativeDriver: false,
          }).start(() => {
            onSwipeLeft();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dy < -120) {
          // Swipe up - SKIP
          Animated.spring(pan, {
            toValue: { x: gestureState.dx, y: -SCREEN_HEIGHT },
            useNativeDriver: false,
          }).start(() => {
            onSwipeUp();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dy > 120) {
          // Swipe down - PREVIOUS
          Animated.spring(pan, {
            toValue: { x: gestureState.dx, y: SCREEN_HEIGHT },
            useNativeDriver: false,
          }).start(() => {
            onSwipeDown();
            pan.setValue({ x: 0, y: 0 });
          });
        } else {
          // Spring back to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  if (!isTop) {
    return (
      <View style={[styles.card, styles.cardBehind]}>
        <LinearGradient
          colors={['#1C1C1E', '#2C2C2E']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>
    );
  }

  const getDefaultImage = (category: string) => {
    const categoryImages: { [key: string]: string } = {
      'Economics': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      'Markets': 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800',
      'Crypto': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800',
      'Politics': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
      'Technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800',
    };
    return categoryImages[category] || 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800';
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: rotate },
          ],
        },
      ]}>
      
      {/* Background gradient for glossy effect */}
      <LinearGradient
        colors={['#1A1A1C', '#0A0A0B']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Image with overlay */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: prediction.image_url || getDefaultImage(prediction.category) }}
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Glossy overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.imageOverlay}
        />

        {/* Shimmer effect for glossiness */}
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255, 255, 255, 0.1)',
              'rgba(255, 255, 255, 0.2)',
              'rgba(255, 255, 255, 0.1)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category badge */}
        <View style={styles.categoryContainer}>
          <LinearGradient
            colors={['#00D4FF', '#0099CC']}
            style={styles.categoryGradient}
          >
            <Text style={styles.category}>{prediction.category.toUpperCase()}</Text>
          </LinearGradient>
        </View>

        {/* Question */}
        <Text style={styles.question}>{prediction.title}</Text>

        {/* Odds display */}
        <View style={styles.oddsContainer}>
          <View style={styles.oddItem}>
            <Text style={styles.oddLabel}>NO</Text>
            <LinearGradient
              colors={['#FF3B30', '#E63329']}
              style={styles.oddValueContainer}
            >
              <Text style={styles.oddValue}>{prediction.no_price}%</Text>
            </LinearGradient>
          </View>
          
          <View style={styles.oddsDivider} />
          
          <View style={styles.oddItem}>
            <Text style={styles.oddLabel}>YES</Text>
            <LinearGradient
              colors={['#34C759', '#30B350']}
              style={styles.oddValueContainer}
            >
              <Text style={styles.oddValue}>{prediction.yes_price}%</Text>
            </LinearGradient>
          </View>
        </View>

        {/* End date */}
        <View style={styles.endDateContainer}>
          <Text style={styles.endDateLabel}>Closes</Text>
          <Text style={styles.endDate}>
            {new Date(prediction.end_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
        </View>
      </View>

      {/* Swipe indicators */}
      <Animated.View style={[styles.choiceContainer, styles.yesChoice, { opacity: yesOpacity }]}>
        <Text style={styles.choiceText}>YES</Text>
      </Animated.View>

      <Animated.View style={[styles.choiceContainer, styles.noChoice, { opacity: noOpacity }]}>
        <Text style={styles.choiceText}>NO</Text>
      </Animated.View>

      <Animated.View style={[styles.choiceContainer, styles.skipChoice, { opacity: skipOpacity }]}>
        <Text style={styles.choiceText}>SKIP</Text>
      </Animated.View>

      {/* Glass effect border */}
      <View style={styles.glassBorder} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 20,
    height: SCREEN_HEIGHT * 0.78,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
  },
  cardBehind: {
    transform: [{ scale: 0.95 }],
  },
  glassBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.3)',
    pointerEvents: 'none',
  },
  imageContainer: {
    height: '55%',
    width: '100%',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    width: SCREEN_WIDTH * 2,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  categoryContainer: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
  },
  categoryGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  category: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 20,
  },
  oddsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  oddItem: {
    flex: 1,
    alignItems: 'center',
  },
  oddLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
    fontWeight: '600',
  },
  oddValueContainer: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  oddValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  oddsDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  endDateContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  endDateLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
  },
  endDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
  },
  choiceContainer: {
    position: 'absolute',
    padding: 16,
    borderRadius: 20,
    borderWidth: 4,
  },
  yesChoice: {
    top: '40%',
    right: 20,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderColor: '#34C759',
  },
  noChoice: {
    top: '40%',
    left: 20,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderColor: '#FF3B30',
  },
  skipChoice: {
    top: 20,
    alignSelf: 'center',
    left: SCREEN_WIDTH / 2 - 60,
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
    borderColor: '#8E8E93',
  },
  choiceText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});

export default SwipeableCard;
