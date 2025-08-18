// app/(tabs)/index.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
} from 'react-native';
import { Heart, MessageCircle, Share2, Flame, Zap, Coins } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import SwipeableCard from '../../components/SwipeableCard';
import CartFloatingButton from '../../components/CartFloatingButton';
import CommentModal from '../../components/CommentModal';
import { tokens } from '../../theme/tokens';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { getRelevantImage } from '../../services/imageService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARDS_BEFORE_CHECKOUT = 20;

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

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([
    {
      id: '1',
      title: 'Will the Fed cut interest rates by 0.5% at the next meeting?',
      category: 'Economics',
      keywords: ['federal reserve', 'interest rates', 'economy', 'finance'],
      yes_price: 65,
      no_price: 35,
      end_date: '2024-12-23',
    },
    {
      id: '2',
      title: 'Will Tesla stock reach $300 by end of month?',
      category: 'Markets',
      keywords: ['tesla', 'stock market', 'electric vehicles', 'elon musk'],
      yes_price: 42,
      no_price: 58,
      end_date: '2024-12-31',
    },
    {
      id: '3',
      title: 'Will Bitcoin hit $100,000 before 2025?',
      category: 'Crypto',
      keywords: ['bitcoin', 'cryptocurrency', 'blockchain', 'digital currency'],
      yes_price: 78,
      no_price: 22,
      end_date: '2024-12-31',
    },
    {
      id: '4',
      title: 'Will there be a government shutdown this month?',
      category: 'Politics',
      keywords: ['government', 'congress', 'politics', 'shutdown'],
      yes_price: 30,
      no_price: 70,
      end_date: '2024-12-20',
    },
    {
      id: '5',
      title: 'Will Apple announce new MacBooks in January?',
      category: 'Technology',
      keywords: ['apple', 'macbook', 'technology', 'computers'],
      yes_price: 55,
      no_price: 45,
      end_date: '2025-01-31',
    },
    {
      id: '6',
      title: 'Will the Lakers make the playoffs this season?',
      category: 'Sports',
      keywords: ['lakers', 'nba', 'basketball', 'playoffs'],
      yes_price: 68,
      no_price: 32,
      end_date: '2025-04-15',
    },
    {
      id: '7',
      title: 'Will SpaceX successfully launch Starship to orbit?',
      category: 'Technology',
      keywords: ['spacex', 'starship', 'space', 'rocket'],
      yes_price: 73,
      no_price: 27,
      end_date: '2025-03-01',
    },
    {
      id: '8',
      title: 'Will inflation drop below 2% by Q2 2025?',
      category: 'Economics',
      keywords: ['inflation', 'economy', 'prices', 'federal reserve'],
      yes_price: 45,
      no_price: 55,
      end_date: '2025-06-30',
    },
    {
      id: '9',
      title: 'Will Netflix stock hit $700 before March?',
      category: 'Markets',
      keywords: ['netflix', 'stock market', 'streaming', 'entertainment'],
      yes_price: 38,
      no_price: 62,
      end_date: '2025-03-01',
    },
    {
      id: '10',
      title: 'Will the EU pass new AI regulations this quarter?',
      category: 'Politics',
      keywords: ['european union', 'ai', 'regulations', 'artificial intelligence'],
      yes_price: 82,
      no_price: 18,
      end_date: '2025-03-31',
    },
    {
      id: '11',
      title: 'Will Ethereum reach $5000 by February?',
      category: 'Crypto',
      keywords: ['ethereum', 'cryptocurrency', 'blockchain', 'crypto'],
      yes_price: 51,
      no_price: 49,
      end_date: '2025-02-28',
    },
    {
      id: '12',
      title: 'Will the Super Bowl have over 120 million viewers?',
      category: 'Sports',
      keywords: ['super bowl', 'nfl', 'football', 'television'],
      yes_price: 76,
      no_price: 24,
      end_date: '2025-02-10',
    },
    {
      id: '13',
      title: 'Will Google announce a new Pixel Fold?',
      category: 'Technology',
      keywords: ['google', 'pixel', 'smartphone', 'foldable'],
      yes_price: 64,
      no_price: 36,
      end_date: '2025-05-15',
    },
    {
      id: '14',
      title: 'Will oil prices exceed $100 per barrel?',
      category: 'Markets',
      keywords: ['oil', 'energy', 'petroleum', 'commodities'],
      yes_price: 29,
      no_price: 71,
      end_date: '2025-04-01',
    },
    {
      id: '15',
      title: 'Will China ease COVID restrictions further?',
      category: 'Politics',
      keywords: ['china', 'covid', 'pandemic', 'restrictions'],
      yes_price: 88,
      no_price: 12,
      end_date: '2025-02-01',
    },
    {
      id: '16',
      title: 'Will Manchester City win the Champions League?',
      category: 'Sports',
      keywords: ['manchester city', 'champions league', 'soccer', 'football'],
      yes_price: 47,
      no_price: 53,
      end_date: '2025-06-01',
    },
    {
      id: '17',
      title: 'Will Microsoft acquire another major gaming studio?',
      category: 'Technology',
      keywords: ['microsoft', 'gaming', 'xbox', 'acquisition'],
      yes_price: 59,
      no_price: 41,
      end_date: '2025-06-30',
    },
    {
      id: '18',
      title: 'Will unemployment stay below 4% through Q1?',
      category: 'Economics',
      keywords: ['unemployment', 'jobs', 'economy', 'labor market'],
      yes_price: 71,
      no_price: 29,
      end_date: '2025-03-31',
    },
    {
      id: '19',
      title: 'Will AMC stock double in value?',
      category: 'Markets',
      keywords: ['amc', 'stock market', 'cinema', 'entertainment'],
      yes_price: 22,
      no_price: 78,
      end_date: '2025-12-31',
    },
    {
      id: '20',
      title: 'Will there be a major crypto hack over $100M?',
      category: 'Crypto',
      keywords: ['cryptocurrency', 'hack', 'security', 'blockchain'],
      yes_price: 43,
      no_price: 57,
      end_date: '2025-06-30',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [swipedCards, setSwipedCards] = useState(0);
  const [preloadedImages, setPreloadedImages] = useState<{[key: string]: string}>({});
  const [showComments, setShowComments] = useState(false);
  const [currentPredictionForComments, setCurrentPredictionForComments] = useState<Prediction | null>(null);

  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems) || [];
  const getUserStats = useUserStore((state) => state.getUserStats);
  const formatCredits = useUserStore((state) => state.formatCredits);

  // Get user stats with safe defaults
  const userStats = getUserStats();

  // Preload images for all predictions
  useEffect(() => {
    const preloadImages = async () => {
      const imageMap: {[key: string]: string} = {};
      
      for (const prediction of predictions) {
        const imageUrl = await getRelevantImage(prediction.keywords || [prediction.category]);
        imageMap[prediction.id] = imageUrl;
      }
      
      setPreloadedImages(imageMap);
    };

    preloadImages();
  }, []);

  // Update predictions with preloaded images
  useEffect(() => {
    setPredictions(prevPredictions => 
      prevPredictions.map(pred => ({
        ...pred,
        image_url: preloadedImages[pred.id] || pred.image_url
      }))
    );
  }, [preloadedImages]);

  useEffect(() => {
    // Check if we've swiped through 20 cards
    if (swipedCards >= CARDS_BEFORE_CHECKOUT && swipedCards % CARDS_BEFORE_CHECKOUT === 0) {
      // Navigate to checkout
      router.push('/(modals)/checkout');
    }
  }, [swipedCards, cartItems.length]);

  const handleSwipeLeft = useCallback(() => {
    const current = predictions[currentIndex];
    console.log('Swiped NO on:', current.title);
    
    // Add to cart with NO selection
    addToCart({
      predictionId: current.id,
      prediction: current,
      position: 'no',
      amount: 100,
    });
    
    setCurrentIndex((prev) => (prev + 1) % predictions.length);
    setSwipedCards((prev) => prev + 1);
    setIsLiked(false);
  }, [currentIndex, predictions, addToCart]);

  const handleSwipeRight = useCallback(() => {
    const current = predictions[currentIndex];
    console.log('Swiped YES on:', current.title);
    
    // Add to cart with YES selection
    addToCart({
      predictionId: current.id,
      prediction: current,
      position: 'yes',
      amount: 100,
    });
    
    setCurrentIndex((prev) => (prev + 1) % predictions.length);
    setSwipedCards((prev) => prev + 1);
    setIsLiked(false);
  }, [currentIndex, predictions, addToCart]);

  const handleSwipeUp = useCallback(() => {
    // Skip to next without adding to cart
    console.log('Skipped:', predictions[currentIndex].title);
    setCurrentIndex((prev) => (prev + 1) % predictions.length);
    setIsLiked(false);
  }, [currentIndex, predictions]);

  const handleSwipeDown = useCallback(() => {
    // Go to previous card
    console.log('Previous card');
    setCurrentIndex((prev) => (prev - 1 + predictions.length) % predictions.length);
    setIsLiked(false);
  }, [predictions.length]);

  const handleLike = useCallback(() => {
    setIsLiked(!isLiked);
  }, [isLiked]);

  const handleShare = useCallback(() => {
    console.log('Share prediction:', predictions[currentIndex].title);
  }, [currentIndex, predictions]);

  const handleComment = useCallback(() => {
    setCurrentPredictionForComments(predictions[currentIndex]);
    setShowComments(true);
  }, [currentIndex, predictions]);

  // Try to load logo from assets, fallback to text
  const LogoComponent = () => {
    try {
      return (
        <Image
          source={require('../../assets/betcha-new-v2.png')}
          style={styles.logo}
          resizeMode="contain"
          onError={() => console.log('Logo failed to load')}
        />
      );
    } catch (error) {
      // Fallback to text if image doesn't exist
      return <Text style={styles.logoText}>Betcha</Text>;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Header with logo and stats */}
      <View style={styles.header}>
        <LogoComponent />
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={styles.iconGradient}>
                <Flame size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.statText}>{userStats.streak}</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={styles.iconGradient}>
                <Zap size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.statText}>{userStats.xp}</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={styles.iconGradient}>
                <Coins size={18} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.statText}>{formatCredits(userStats.credits)}</Text>
          </View>
        </View>
      </View>

      {/* Card stack - full screen */}
      <View style={styles.cardContainer}>
        {predictions.slice(currentIndex, currentIndex + 3).map((prediction, index) => {
          if (index === 0) {
            return (
              <SwipeableCard
                key={`${prediction.id}-${currentIndex}`}
                prediction={prediction}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
                onSwipeDown={handleSwipeDown}
                onLike={handleLike}
                isTop={true}
              />
            );
          }
          return (
            <View
              key={`${prediction.id}-${currentIndex}-placeholder`}
              style={[
                styles.cardPlaceholder,
                { 
                  zIndex: -index,
                  transform: [
                    { scale: 1 - index * 0.03 },
                    { translateY: index * 8 },
                  ],
                },
              ]}
            />
          );
        })}
      </View>

      {/* Action buttons - vertical on right side */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity onPress={handleComment} style={styles.actionButton}>
          <MessageCircle size={22} color={tokens.colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
          <Share2 size={22} color={tokens.colors.textSecondary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Heart
            size={22}
            color={isLiked ? tokens.colors.primary : tokens.colors.textSecondary}
            fill={isLiked ? tokens.colors.primary : 'transparent'}
            strokeWidth={isLiked ? 3 : 2}
          />
        </TouchableOpacity>
      </View>

      {/* Carousel dots at very bottom */}
      <View style={styles.carouselContainer}>
        <View style={styles.carouselDots}>
          {Array.from({ length: Math.min(5, predictions.length - currentIndex) }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === 0 && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Cart floating button */}
      {cartItems.length > 0 && (
        <CartFloatingButton 
          count={cartItems.length}
          onPress={() => {
            router.push('/(modals)/checkout');
          }}
        />
      )}

      {/* Comment Modal */}
      {showComments && currentPredictionForComments && (
        <CommentModal
          visible={showComments}
          prediction={currentPredictionForComments}
          onClose={() => {
            setShowComments(false);
            setCurrentPredictionForComments(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    zIndex: 100,
  },
  logo: {
    width: 120,
    height: 50,
    marginLeft: -10,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: tokens.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(26, 26, 28, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statText: {
    color: tokens.colors.color,
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholder: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: tokens.colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: 120,
    right: 16,
    gap: 12,
    zIndex: 101,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(26, 26, 28, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: tokens.colors.glassBorder,
  },
  carouselContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 102,
  },
  carouselDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: tokens.colors.primary,
    width: 18,
  },
});

export default HomeScreen;
