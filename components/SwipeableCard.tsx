import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { tokens } from '../theme/tokens';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

// Image cache for faster loading
const imageCache = new Map<string, string>();

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
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onLike?: () => void;
  isTop: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  prediction,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLike,
  isTop,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const position = useRef(new Animated.ValueXY()).current;
  const swipeIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const [currentChoice, setCurrentChoice] = useState<'YES' | 'NO' | null>(null);
  const lastTap = useRef<number | null>(null);

  // Generate highly relevant image URLs with better caching
  const getImageUrl = () => {
    const cacheKey = `${prediction.id}-${prediction.category}`;
    
    // Check cache first
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!;
    }

    const title = prediction.title.toLowerCase();
    const category = prediction.category.toLowerCase();
    
    // Use highly specific, relevant images
    let imageUrl = '';
    
    if (title.includes('bitcoin') || title.includes('crypto') || category === 'crypto') {
      imageUrl = 'https://picsum.photos/id/1/1080/1920'; // Tech/abstract
    } else if (title.includes('tesla') || title.includes('car') || title.includes('electric')) {
      imageUrl = 'https://picsum.photos/id/1071/1080/1920'; // Car
    } else if (title.includes('stock') || title.includes('market') || category === 'markets') {
      imageUrl = 'https://picsum.photos/id/367/1080/1920'; // Business/office
    } else if (title.includes('fed') || title.includes('interest') || title.includes('inflation') || category === 'economics') {
      imageUrl = 'https://picsum.photos/id/380/1080/1920'; // Finance/building
    } else if (title.includes('government') || title.includes('shutdown') || category === 'politics') {
      imageUrl = 'https://picsum.photos/id/274/1080/1920'; // Architecture
    } else if (title.includes('apple') || title.includes('macbook') || title.includes('google') || title.includes('pixel') || category === 'technology') {
      imageUrl = 'https://picsum.photos/id/2/1080/1920'; // Technology
    } else if (title.includes('space') || title.includes('spacex') || title.includes('starship')) {
      imageUrl = 'https://picsum.photos/id/975/1080/1920'; // Space/sky
    } else if (title.includes('lakers') || title.includes('playoffs') || title.includes('super bowl') || category === 'sports') {
      imageUrl = 'https://picsum.photos/id/48/1080/1920'; // Sports
    } else if (title.includes('eu') || title.includes('ai regulations') || title.includes('china') || title.includes('covid')) {
      imageUrl = 'https://picsum.photos/id/1048/1080/1920'; // City/government
    } else if (title.includes('netflix') || title.includes('amc') || title.includes('oil') || title.includes('unemployment')) {
      imageUrl = 'https://picsum.photos/id/367/1080/1920'; // Business/finance
    } else {
      // Fallback to category-based images
      switch (category) {
        case 'economics':
          imageUrl = 'https://picsum.photos/id/380/1080/1920';
          break;
        case 'markets':
          imageUrl = 'https://picsum.photos/id/367/1080/1920';
          break;
        case 'politics':
          imageUrl = 'https://picsum.photos/id/1048/1080/1920';
          break;
        case 'technology':
          imageUrl = 'https://picsum.photos/id/2/1080/1920';
          break;
        case 'sports':
          imageUrl = 'https://picsum.photos/id/48/1080/1920';
          break;
        case 'crypto':
          imageUrl = 'https://picsum.photos/id/1/1080/1920';
          break;
        default:
          imageUrl = 'https://picsum.photos/id/367/1080/1920'; // Business as default
      }
    }
    
    // Cache the URL
    imageCache.set(cacheKey, imageUrl);
    return imageUrl;
  };

  const [imageUrl, setImageUrl] = useState(getImageUrl());

  // Pre-load next few images for smoother experience
  useEffect(() => {
    if (isTop) {
      // Pre-load next 2-3 images
      const preloadImages = () => {
        const nextPredictions = [
          { id: `${parseInt(prediction.id) + 1}`, category: prediction.category },
          { id: `${parseInt(prediction.id) + 2}`, category: prediction.category },
          { id: `${parseInt(prediction.id) + 3}`, category: prediction.category },
        ];
        
        nextPredictions.forEach(nextPred => {
          const nextCacheKey = `${nextPred.id}-${nextPred.category}`;
          if (!imageCache.has(nextCacheKey)) {
            const nextImageUrl = getImageUrl();
            // Pre-fetch the image
            Image.prefetch(nextImageUrl).catch(() => {});
          }
        });
      };
      
      preloadImages();
    }
  }, [isTop, prediction.id, prediction.category]);

  // Handle image load error with guaranteed fallback
  const handleImageError = () => {
    console.log('Primary image failed, using fallback...');
    const fallbackUrl = 'https://picsum.photos/id/367/1080/1920'; // Business fallback
    setImageUrl(fallbackUrl);
  };

  // Double tap handler for like
  const handleCardPress = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      // Double tap detected
      setIsLiked(!isLiked);
      onLike?.();
      // Show heart animation briefly then hide
      Animated.sequence([
        Animated.timing(swipeIndicatorOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(200),
        Animated.timing(swipeIndicatorOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsLiked(false); // Hide heart after animation
      });
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

  const likeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

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
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return isTop && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isTop) {
          position.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isTop) return;
        
        // Check for horizontal swipes first (stronger threshold)
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
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
            // Spring back
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              friction: 4,
              useNativeDriver: true,
            }).start();
          }
        } 
        // Check for vertical swipes
        else if (Math.abs(gestureState.dy) > SWIPE_THRESHOLD / 2) {
          if (gestureState.dy < -SWIPE_THRESHOLD / 2 && onSwipeUp) {
            // Swipe up - Skip/Next
            Animated.timing(position, {
              toValue: { x: gestureState.dx, y: -SCREEN_HEIGHT },
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }).start(() => {
              onSwipeUp();
              position.setValue({ x: 0, y: 0 });
            });
          } else if (gestureState.dy > SWIPE_THRESHOLD / 2 && onSwipeDown) {
            // Swipe down - Previous
            Animated.timing(position, {
              toValue: { x: gestureState.dx, y: SCREEN_HEIGHT },
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }).start(() => {
              onSwipeDown();
              position.setValue({ x: 0, y: 0 });
            });
          } else {
            // Spring back
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              friction: 4,
              useNativeDriver: true,
            }).start();
          }
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

  return (
    <Animated.View
      style={[styles.card, rotateAndTranslate]}
      {...panResponder.panHandlers}
    >
      <TouchableWithoutFeedback onPress={handleCardPress}>
        <View style={styles.cardContent}>
          {/* Glossy overlay for fresh card pack feel */}
          <LinearGradient
            colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)', 'transparent']}
            style={styles.glossOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.6, y: 0.6 }}
          />
          
          {/* Shimmer effect for extra gloss */}
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
            style={styles.shimmerOverlay}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />

          {/* Left red gradient - NO */}
          <LinearGradient
            colors={['rgba(239, 68, 68, 0.4)', 'transparent']}
            style={styles.leftGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Right green gradient - YES */}
          <LinearGradient
            colors={['transparent', 'rgba(34, 197, 94, 0.4)']}
            style={styles.rightGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />

          {/* Dynamic swipe indicators */}
          <Animated.View
            style={[
              styles.likeTextContainer,
              { opacity: likeOpacity },
            ]}
          >
            <Text style={styles.likeText}>YES</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.nopeTextContainer,
              { opacity: nopeOpacity },
            ]}
          >
            <Text style={styles.nopeText}>NO</Text>
          </Animated.View>

          {/* Swipe confirmation indicator */}
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
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            defaultSource={{ uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' }}
          />

          {/* Loading placeholder */}
          {!imageLoaded && (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          )}

          {/* Info section with blur background - bottom area */}
          <View style={styles.infoSection}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.85)' }]} />
            )}
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={StyleSheet.absoluteFill}
            />
            
            <View style={styles.infoContainer}>
              <View style={styles.categoryBox}>
                <Text style={styles.categoryText}>{prediction.category.toUpperCase()}</Text>
              </View>
              
              <View style={styles.titleBox}>
                <Text style={styles.titleText} numberOfLines={2}>
                  {prediction.title}
                </Text>
              </View>

              {/* Yes/No prices - positioned higher */}
              <View style={styles.priceContainer}>
                <View style={styles.priceBox}>
                  <Text style={styles.noText}>NO</Text>
                  <Text style={styles.priceText}>{prediction.no_price}%</Text>
                </View>
                <View style={styles.priceBox}>
                  <Text style={styles.yesText}>YES</Text>
                  <Text style={styles.priceText}>{prediction.yes_price}%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Like heart indicator (shows on double tap then disappears) */}
          {isLiked && (
            <Animated.View
              style={[
                styles.likedHeart,
                { opacity: swipeIndicatorOpacity }
              ]}
            >
              <View style={styles.heartContainer}>
                <View style={[styles.heart, { backgroundColor: tokens.colors.primary }]} />
                <View style={[styles.heartLeft, { backgroundColor: tokens.colors.primary }]} />
                <View style={[styles.heartRight, { backgroundColor: tokens.colors.primary }]} />
              </View>
            </Animated.View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: tokens.colors.surface,
    shadowColor: tokens.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
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
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: -100,
    right: -100,
    height: '100%',
    zIndex: 11,
    pointerEvents: 'none',
    transform: [{ rotate: '30deg' }],
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
  likeTextContainer: {
    position: 'absolute',
    top: 100,
    right: 40,
    transform: [{ rotate: '30deg' }],
    zIndex: 20,
  },
  likeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#22C55E',
    borderWidth: 3,
    borderColor: '#22C55E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  nopeTextContainer: {
    position: 'absolute',
    top: 100,
    left: 40,
    transform: [{ rotate: '-30deg' }],
    zIndex: 20,
  },
  nopeText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#EF4444',
    borderWidth: 3,
    borderColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 25,
  },
  swipeIndicatorText: {
    fontSize: 64,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0a0a0a',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: tokens.colors.textSecondary,
    fontSize: 16,
  },
  infoSection: {
    position: 'absolute',
    bottom: 80, // Moved up to avoid being cut off
    left: 0,
    right: 0,
    height: 200, // Fixed height
    overflow: 'hidden',
  },
  infoContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-end',
  },
  categoryBox: {
    backgroundColor: tokens.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: tokens.radius.md,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    color: tokens.colors.background,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  titleBox: {
    marginBottom: 20,
  },
  titleText: {
    color: tokens.colors.color,
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  yesText: {
    color: '#22C55E',
    fontSize: 26,
    fontWeight: 'bold',
  },
  noText: {
    color: '#EF4444',
    fontSize: 26,
    fontWeight: 'bold',
  },
  priceText: {
    color: tokens.colors.color,
    fontSize: 26,
    fontWeight: '600',
  },
  likedHeart: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -32 }, { translateY: -32 }],
    zIndex: 30,
  },
  heartContainer: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  heart: {
    position: 'absolute',
    width: 50,
    height: 45,
    left: 7,
    top: 15,
    transform: [{ rotate: '-45deg' }],
    borderRadius: 25,
  },
  heartLeft: {
    position: 'absolute',
    width: 26,
    height: 26,
    left: 5,
    top: 5,
    borderRadius: 13,
  },
  heartRight: {
    position: 'absolute',
    width: 26,
    height: 26,
    right: 5,
    top: 5,
    borderRadius: 13,
  },
});

export default SwipeableCard;
