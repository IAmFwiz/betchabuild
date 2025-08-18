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
      title: 'Will Taylor Swift announce a new album before February?',
      category: 'Entertainment',
      image_url: 'https://images.unsplash.com/photo-1624091225789-30d6a58bfeef?w=800&q=80', // Taylor Swift concert aesthetic
      keywords: ['taylor swift', 'music', 'album', 'pop star', 'celebrity'],
      yes_price: 65,
      no_price: 35,
      end_date: '2025-02-28',
    },
    {
      id: '2',
      title: 'Will Oppenheimer win Best Picture at the Oscars?',
      category: 'Movies',
      image_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=800&q=80', // Film/cinema aesthetic
      keywords: ['oscars', 'academy awards', 'oppenheimer', 'christopher nolan', 'movies'],
      yes_price: 72,
      no_price: 28,
      end_date: '2025-03-10',
    },
    {
      id: '3',
      title: 'Will GTA 6 be delayed past 2025?',
      category: 'Gaming',
      image_url: 'https://images.unsplash.com/photo-1618193006865-38d47c7f8f07?w=800&q=80', // GTA-style city view
      keywords: ['gta 6', 'grand theft auto', 'video games', 'rockstar', 'gaming'],
      yes_price: 45,
      no_price: 55,
      end_date: '2025-06-30',
    },
    {
      id: '4',
      title: 'Will Marvel announce a new Avengers movie this year?',
      category: 'Movies',
      image_url: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=800&q=80', // Marvel superhero theme
      keywords: ['marvel', 'avengers', 'mcu', 'superhero', 'movies'],
      yes_price: 58,
      no_price: 42,
      end_date: '2025-12-31',
    },
    {
      id: '5',
      title: 'Will Beyoncé go on world tour in 2025?',
      category: 'Music',
      image_url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80', // Concert with golden lights
      keywords: ['beyonce', 'concert', 'world tour', 'music', 'performance'],
      yes_price: 81,
      no_price: 19,
      end_date: '2025-03-31',
    },
    {
      id: '6',
      title: 'Will the Super Bowl halftime show feature a reunion?',
      category: 'Sports',
      image_url: 'https://images.unsplash.com/photo-1566479179817-0ddb5fa87cd9?w=800&q=80', // Super Bowl stadium
      keywords: ['super bowl', 'halftime show', 'nfl', 'music', 'performance'],
      yes_price: 34,
      no_price: 66,
      end_date: '2025-02-09',
    },
    {
      id: '7',
      title: 'Will Netflix release Stranger Things final season in 2025?',
      category: 'TV Shows',
      image_url: 'https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&q=80', // Netflix on TV screen
      keywords: ['stranger things', 'netflix', 'tv series', 'streaming', 'entertainment'],
      yes_price: 89,
      no_price: 11,
      end_date: '2025-12-31',
    },
    {
      id: '8',
      title: 'Will Drake drop a surprise album this year?',
      category: 'Music',
      image_url: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?w=800&q=80', // Hip hop concert
      keywords: ['drake', 'hip hop', 'rap', 'album', 'music'],
      yes_price: 67,
      no_price: 33,
      end_date: '2025-12-31',
    },
    {
      id: '9',
      title: 'Will Bad Bunny headline Coachella 2025?',
      category: 'Music',
      image_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80', // Festival crowd
      keywords: ['bad bunny', 'coachella', 'festival', 'music', 'concert'],
      yes_price: 76,
      no_price: 24,
      end_date: '2025-01-15',
    },
    {
      id: '10',
      title: 'Will a K-pop group perform at the Super Bowl?',
      category: 'Entertainment',
      image_url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&q=80', // K-pop concert
      keywords: ['kpop', 'bts', 'blackpink', 'super bowl', 'performance'],
      yes_price: 22,
      no_price: 78,
      end_date: '2025-02-09',
    },
    {
      id: '11',
      title: 'Will Tom Holland announce engagement this year?',
      category: 'Celebrity',
      image_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80', // Celebrity couple aesthetic
      keywords: ['tom holland', 'zendaya', 'celebrity', 'engagement', 'spider-man'],
      yes_price: 43,
      no_price: 57,
      end_date: '2025-12-31',
    },
    {
      id: '12',
      title: 'Will The Weeknd win a Grammy this year?',
      category: 'Music',
      image_url: 'https://images.unsplash.com/photo-1598387846419-a2c870ad3ecd?w=800&q=80', // Grammy awards aesthetic
      keywords: ['the weeknd', 'grammys', 'music awards', 'music', 'awards'],
      yes_price: 71,
      no_price: 29,
      end_date: '2025-02-02',
    },
    {
      id: '13',
      title: 'Will Disney+ surpass Netflix in subscribers?',
      category: 'Entertainment',
      image_url: 'https://images.unsplash.com/photo-1597466765990-64ad1c35dafc?w=800&q=80', // Disney castle
      keywords: ['disney plus', 'netflix', 'streaming', 'entertainment', 'tv'],
      yes_price: 28,
      no_price: 72,
      end_date: '2025-12-31',
    },
    {
      id: '14',
      title: 'Will there be a Friends reunion special announcement?',
      category: 'TV Shows',
      image_url: 'https://images.unsplash.com/photo-1606924735276-fbb5b325e933?w=800&q=80', // Friends couch/cafe aesthetic
      keywords: ['friends', 'tv show', 'reunion', 'comedy', 'entertainment'],
      yes_price: 15,
      no_price: 85,
      end_date: '2025-06-30',
    },
    {
      id: '15',
      title: 'Will Rihanna release new music in 2025?',
      category: 'Music',
      image_url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80', // Female performer
      keywords: ['rihanna', 'music', 'album', 'r&b', 'pop'],
      yes_price: 52,
      no_price: 48,
      end_date: '2025-12-31',
    },
    {
      id: '16',
      title: 'Will the next James Bond actor be announced?',
      category: 'Movies',
      image_url: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?w=800&q=80', // James Bond aesthetic
      keywords: ['james bond', '007', 'movies', 'actor', 'announcement'],
      yes_price: 69,
      no_price: 31,
      end_date: '2025-06-30',
    },
    {
      id: '17',
      title: 'Will Barbie win any Oscars?',
      category: 'Movies',
      image_url: 'https://images.unsplash.com/photo-1626278664285-f796b9ee7806?w=800&q=80', // Pink Barbie aesthetic
      keywords: ['barbie', 'oscars', 'margot robbie', 'ryan gosling', 'awards'],
      yes_price: 84,
      no_price: 16,
      end_date: '2025-03-10',
    },
    {
      id: '18',
      title: 'Will Travis Kelce and Taylor Swift get engaged?',
      category: 'Celebrity',
      image_url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80', // Romance/engagement aesthetic
      keywords: ['travis kelce', 'taylor swift', 'celebrity couple', 'nfl', 'engagement'],
      yes_price: 38,
      no_price: 62,
      end_date: '2025-12-31',
    },
    {
      id: '19',
      title: 'Will TikTok be banned in the US?',
      category: 'Social Media',
      image_url: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80', // TikTok on phone
      keywords: ['tiktok', 'social media', 'ban', 'politics', 'technology'],
      yes_price: 41,
      no_price: 59,
      end_date: '2025-06-30',
    },
    {
      id: '20',
      title: 'Will Saturday Night Live get a new host?',
      category: 'TV Shows',
      image_url: 'https://images.unsplash.com/photo-1524169358666-79f22534bc6e?w=800&q=80', // Comedy stage
      keywords: ['snl', 'saturday night live', 'comedy', 'tv show', 'host'],
      yes_price: 55,
      no_price: 45,
      end_date: '2025-09-30',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [swipedCards, setSwipedCards] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [currentPredictionForComments, setCurrentPredictionForComments] = useState<Prediction | null>(null);

  const addToCart = useCartStore((state) => state.addToCart);
  const cartItems = useCartStore((state) => state.cartItems) || [];
  const getUserStats = useUserStore((state) => state.getUserStats);
  const formatCredits = useUserStore((state) => state.formatCredits);

  // Get user stats with safe defaults
  const userStats = getUserStats();

  // Preload all images immediately on mount
  useEffect(() => {
    const preloadAllImages = async () => {
      // Create Image objects to preload all images
      predictions.forEach(prediction => {
        if (prediction.image_url) {
          const img = new Image();
          img.src = prediction.image_url;
        }
      });
    };

    preloadAllImages();
  }, [predictions]);

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
      // Try alternative logo files
      try {
        return (
          <Image
            source={require('../../assets/newbetcha-transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        );
      } catch (error2) {
        // Fallback to text if image doesn't exist
        return <Text style={styles.logoText}>Betcha</Text>;
      }
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
                <Flame size={14} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.statText}>{userStats.streak}</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={styles.iconGradient}>
                <Zap size={14} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.statText}>{userStats.xp}</Text>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={styles.iconGradient}>
                <Coins size={14} color="#FFFFFF" />
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
    width: 240,  // 100% bigger (was 120)
    height: 100, // 100% bigger (was 50)
    marginLeft: -50, // Moved left by 50
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: tokens.colors.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginRight: 10,  // Move left by adding right margin
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,  // Reduced from 6
    backgroundColor: 'rgba(26, 26, 28, 0.95)',
    paddingHorizontal: 6,  // Reduced from 8 (25% smaller)
    paddingVertical: 3,  // Reduced from 4 (25% smaller)
    borderRadius: 16,  // Reduced from 20
    borderWidth: 1,
    borderColor: 'rgba(79, 195, 247, 0.2)',
  },
  iconContainer: {
    width: 22,  // Reduced from 28 (20% smaller)
    height: 22,  // Reduced from 28 (20% smaller)
    borderRadius: 11,  // Half of width/height
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
    fontSize: 12,  // Reduced from 14
    fontWeight: '700',
    marginRight: 3,  // Reduced from 4
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
