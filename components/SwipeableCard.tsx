// components/SwipeableCard.tsx
import React, { useRef, useEffect, useState } from 'react';
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
  keywords?: string[];
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
  const greenFlashAnimation = useRef(new Animated.Value(0)).current;
  const redFlashAnimation = useRef(new Animated.Value(0)).current;
  
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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

  // CLEAN DEMO IMAGE MAPPING - Using prediction ID for exact matches
  const getDemoImage = (prediction: Prediction) => {
    console.log('Getting image for prediction:', prediction.id, prediction.title);
    
    // Direct ID mapping for exact control
    const imageMap: { [key: string]: string } = {
      // Your existing prediction IDs with perfect images
      '1': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Taylor Swift
      '2': 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80', // Oppenheimer/Film
      '3': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80', // GTA 6/Gaming
      '4': 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&q=80', // Marvel/Superhero
      '5': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', // Beyoncé
      '6': 'https://images.unsplash.com/photo-1566479179817-0ddb5fa87cd9?w=800&q=80', // Super Bowl
      '7': 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&q=80', // Netflix/Stranger Things
      '8': 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80', // Drake/Hip Hop
      '9': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', // Bad Bunny/Coachella
      '10': 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80', // K-pop
      '11': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80', // Tom Holland/Celebrity
      '12': 'https://images.unsplash.com/photo-1598387846419-a2c870ad3ecd?w=800&q=80', // The Weeknd/Grammy
      '13': 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=800&q=80', // Disney+
      '14': 'https://images.unsplash.com/photo-1606924735276-fbb5b325e933?w=800&q=80', // Friends
      '15': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80', // Rihanna - FIXED
      '16': 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=800&q=80', // James Bond
      '17': 'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=800&q=80', // Barbie
      '18': 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80', // Travis & Taylor
      '19': 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80', // TikTok
      '20': 'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=800&q=80', // SNL
    };

    // Use the direct mapping first
    if (imageMap[prediction.id]) {
      console.log('Using mapped image for ID:', prediction.id);
      return imageMap[prediction.id];
    }

    // Fallback to title-based matching for any new predictions
    const title = prediction.title.toLowerCase();
    
    // Specific keyword matching as backup
    if (title.includes('rihanna')) {
      return 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80';
    }
    if (title.includes('beyoncé') || title.includes('beyonce')) {
      return 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80';
    }
    if (title.includes('taylor swift')) {
      return 'https://images.unsplash.com/photo-1624091225789-30d6a58bfeef?w=800&q=80';
    }
    if (title.includes('oppenheimer')) {
      return 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&q=80';
    }
    if (title.includes('gta')) {
      return 'https://images.unsplash.com/photo-1618193006865-38d47c7f8f07?w=800&q=80';
    }
    if (title.includes('spiderman') || title.includes('spider-man') || title.includes('marvel')) {
      return 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&q=80';
    }
    if (title.includes('drake')) {
      return 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80';
    }
    if (title.includes('netflix')) {
      return 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&q=80';
    }
    
    // Use original image_url if provided and no errors
    if (prediction.image_url && !imageError) {
      return prediction.image_url;
    }
    
    // Category fallbacks
    const categoryImages: { [key: string]: string } = {
      'Entertainment': 'https://images.unsplash.com/photo-1489599743784-10ac5c5ab5da?w=800&q=80',
      'Music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
      'Movies': 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&q=80',
      'Gaming': 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80',
      'Sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
      'Celebrity': 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80',
      'TV Shows': 'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=800&q=80',
      'Social Media': 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80',
    };
    
    return categoryImages[prediction.category] || 'https://images.unsplash.com/photo-1614028674026-a65e31bfd27c?w=800&q=80';
  };

  const triggerGreenFlash = () => {
    console.log('Triggering green flash');
    greenFlashAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(greenFlashAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(greenFlashAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const triggerRedFlash = () => {
    console.log('Triggering red flash');
    redFlashAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(redFlashAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(redFlashAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

  const greenFlashTranslate = greenFlashAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_WIDTH, -SCREEN_WIDTH * 0.3],
  });

  const redFlashTranslate = redFlashAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH * 0.3],
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
          triggerGreenFlash();
          Animated.spring(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gestureState.dy },
            useNativeDriver: false,
          }).start(() => {
            onSwipeRight();
            pan.setValue({ x: 0, y: 0 });
          });
        } else if (gestureState.dx < -120) {
          // Swipe left - NO
          triggerRedFlash();
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

  // Preload image when component mounts
  useEffect(() => {
    const imageUri = getDemoImage(prediction);
    const img = Image.prefetch(imageUri)
      .then(() => {
        setImageLoaded(true);
        console.log('Image preloaded successfully:', imageUri);
      })
      .catch((error) => {
        console.log('Image preload failed:', error);
        setImageError(true);
      });
  }, [prediction.id]);

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

  const imageUri = getDemoImage(prediction);

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
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />
        
        {/* Loading placeholder */}
        {!imageLoaded && (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>Loading...</Text>
          </View>
        )}
        
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

      {/* Green Flash Animation (YES) */}
      <Animated.View
        style={[
          styles.swipeFlash,
          {
            opacity: greenFlashAnimation,
            transform: [{ translateX: greenFlashTranslate }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(52, 199, 89, 0.6)', 'rgba(52, 199, 89, 0.8)', 'rgba(52, 199, 89, 0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.flashGradient}
        />
      </Animated.View>

      {/* Red Flash Animation (NO) */}
      <Animated.View
        style={[
          styles.swipeFlash,
          {
            opacity: redFlashAnimation,
            transform: [{ translateX: redFlashTranslate }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 59, 48, 0.6)', 'rgba(255, 59, 48, 0.8)', 'rgba(255, 59, 48, 0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.flashGradient}
        />
      </Animated.View>

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
  swipeFlash: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 1.5,
    pointerEvents: 'none',
    zIndex: 10,
  },
  flashGradient: {
    flex: 1,
    width: '100%',
  },
  imageContainer: {
    height: '55%',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
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

