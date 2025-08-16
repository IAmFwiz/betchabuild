// app/(tabs)/index.tsx

import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  PanResponder,
  Animated,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import kalshiService from '../../services/kalshiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Theme color from Betcha logo
const BETCHA_BLUE = '#00D4FF';
const BETCHA_LIGHT_BLUE = '#4FC3F7';

// Function to get image from keywords or Kalshi
const getImageForCard = async (card: any) => {
  try {
    // First, check if Kalshi provides an image
    if (card.imageUrl) {
      return card.imageUrl;
    }
    
    // Extract keywords from the question
    const keywords = extractKeywords(card.question);
    
    // Try Unsplash
    const UNSPLASH_KEY = process.env.EXPO_PUBLIC_UNSPLASH_KEY;
    if (UNSPLASH_KEY) {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(keywords)}&per_page=1`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_KEY}`
          }
        }
      );
      const data = await response.json();
      if (data.results && data.results[0]) {
        return data.results[0].urls.regular;
      }
    }
    
    // Try Pexels
    const PEXELS_KEY = process.env.EXPO_PUBLIC_PEXELS_KEY;
    if (PEXELS_KEY) {
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(keywords)}&per_page=1`,
        {
          headers: {
            'Authorization': PEXELS_KEY
          }
        }
      );
      const data = await response.json();
      if (data.photos && data.photos[0]) {
        return data.photos[0].src.large;
      }
    }
    
    // If no image found, return Kalshi's default image URL if available
    // This should be fetched from Kalshi's API
    return card.defaultImageUrl || card.fallbackImageUrl || null;
  } catch (error) {
    console.log('Error fetching image:', error);
    return card.imageUrl || card.defaultImageUrl || null;
  }
};

// Extract relevant keywords from title
const extractKeywords = (title: string): string => {
  const patterns = {
    celebrity: /Taylor Swift|Drake|Beyonce|Kanye|Kardashian|LeBron|Brady|Messi|Ronaldo/gi,
    sports: /NFL|NBA|MLB|NHL|UFC|FIFA|Super Bowl|World Cup|Olympics|Lakers|Yankees/gi,
    movies: /Marvel|Disney|Oscar|Netflix|Amazon|Apple|Star Wars|DC/gi,
    tech: /Apple|Google|Tesla|Meta|Twitter|TikTok|AI|crypto|Bitcoin/gi,
  };
  
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = title.match(pattern);
    if (match) return match[0];
  }
  
  return title.split(' ')
    .filter(word => word.length > 3)
    .slice(0, 3)
    .join(' ');
};

// Generate 20 sample cards for testing
const generateSampleBatch = (batchNumber: number) => {
  const questions = [
    'Will Taylor Swift announce a new album this month?',
    'Will Marvel announce Phase 7 at Comic-Con?',
    'Will the Lakers make the playoffs?',
    'Will Barbie win Best Picture at the Oscars?',
    'Will Kim K launch a new SKIMS collection?',
    'Will Apple announce new AirPods this quarter?',
    'Will Drake drop a surprise album before year end?',
    'Will Netflix stock hit $500 this month?',
    'Will the Chiefs win the Super Bowl?',
    'Will GTA 6 release date be announced?',
    'Will Beyonce headline Coachella 2025?',
    'Will Tom Brady come out of retirement?',
    'Will Disney+ surpass Netflix subscribers?',
    'Will Bitcoin hit $100K this year?',
    'Will The Weeknd win a Grammy?',
    'Will Yankees win the World Series?',
    'Will Meta launch new VR headset?',
    'Will Zendaya win an Emmy?',
    'Will UFC 300 break PPV records?',
    'Will Rihanna release new music?',
  ];
  
  return Array.from({ length: 20 }, (_, i) => ({
    id: batchNumber * 20 + i + 1,
    category: ['MUSIC', 'ENTERTAINMENT', 'SPORTS', 'HOLLYWOOD', 'FASHION', 'TECH'][i % 6],
    question: questions[i % questions.length],
    yesPrice: Math.floor(Math.random() * 40) + 30,
    noPrice: 0,
    imageUrl: null, // This would come from Kalshi API
    defaultImageUrl: null, // Kalshi's default image
    endDate: '2025-09-30',
    volume: Math.floor(Math.random() * 500) + 50,
  })).map(bet => ({
    ...bet,
    noPrice: 100 - bet.yesPrice,
    totalVolume: `$${bet.volume}K`,
  }));
};

export default function HomeScreen() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [currentBatch, setCurrentBatch] = useState(0);
  const [credits, setCredits] = useState(100);
  const [xp, setXp] = useState(450);
  const [streak, setStreak] = useState(7);
  const [sessionBets, setSessionBets] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCreditsPurchase, setShowCreditsPurchase] = useState(false);
  const [activeCards, setActiveCards] = useState(generateSampleBatch(0));
  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [cardImages, setCardImages] = useState<{[key: number]: string}>({});
  const [lastSwipeTime, setLastSwipeTime] = useState<Date | null>(null);
  const [swipeHistory, setSwipeHistory] = useState<any[]>([]);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);
  
  const currentCard = activeCards[currentCardIndex];

  // Load images for cards
  useEffect(() => {
    const loadImages = async () => {
      for (const card of activeCards) {
        if (!cardImages[card.id]) {
          const imageUrl = await getImageForCard(card);
          if (imageUrl) {
            setCardImages(prev => ({ ...prev, [card.id]: imageUrl }));
          }
        }
      }
    };
    loadImages();
  }, [activeCards]);

  const rotate = rotateValue.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
  });

  // Gradient opacity for swipe hints (red left for NO, green right for YES)
  const leftGradientOpacity = pan.x.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [0.4, 0, 0],
    extrapolate: 'clamp',
  });

  const rightGradientOpacity = pan.x.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [0, 0, 0.4],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimating.current,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return !isAnimating.current && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: () => {
        Animated.spring(scaleValue, {
          toValue: 0.95,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (evt, gestureState) => {
        if (isAnimating.current) return;
        
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
        rotateValue.setValue(gestureState.dx);
        
        const opacity = 1 - Math.min(Math.abs(gestureState.dx) / (screenWidth * 0.5), 0.3);
        opacityValue.setValue(opacity);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isAnimating.current) return;
        
        const absX = Math.abs(gestureState.dx);
        const absY = Math.abs(gestureState.dy);
        const velocityX = Math.abs(gestureState.vx);
        const velocityY = Math.abs(gestureState.vy);
        
        const isHorizontal = absX > absY;
        
        const horizontalThreshold = screenWidth * 0.25;
        const verticalThreshold = screenHeight * 0.15;
        const velocityThreshold = 0.5;
        
        if (isHorizontal && (absX > horizontalThreshold || velocityX > velocityThreshold)) {
          if (gestureState.dx > 0) {
            // Swipe Right - YES
            handleYes();
          } else {
            // Swipe Left - NO
            handleNo();
          }
        } else if (!isHorizontal && (absY > verticalThreshold || velocityY > velocityThreshold)) {
          if (gestureState.dy < 0) {
            // Swipe Up - Skip
            handleSkip();
          } else if (gestureState.dy > 0) {
            // Swipe Down - Undo last action
            handleUndo();
          } else {
            springBack();
          }
        } else {
          springBack();
        }
      },
    })
  ).current;

  const springBack = () => {
    Animated.parallel([
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
      Animated.spring(rotateValue, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(opacityValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateCardOut = (direction: 'left' | 'right' | 'up' | 'down', onComplete: () => void) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    
    let toValue = { x: 0, y: 0 };
    let rotateEndValue = 0;
    
    switch (direction) {
      case 'left':
        toValue = { x: -screenWidth * 1.5, y: 0 };
        rotateEndValue = -screenWidth / 2;
        break;
      case 'right':
        toValue = { x: screenWidth * 1.5, y: 0 };
        rotateEndValue = screenWidth / 2;
        break;
      case 'up':
        toValue = { x: 0, y: -screenHeight };
        break;
      case 'down':
        toValue = { x: 0, y: screenHeight };
        break;
    }
    
    Animated.parallel([
      Animated.timing(pan, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: rotateEndValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
      pan.setValue({ x: 0, y: 0 });
      rotateValue.setValue(0);
      opacityValue.setValue(1);
      scaleValue.setValue(1);
      isAnimating.current = false;
    });
  };

  const handleYes = () => {
    if (!currentCard || credits <= 0) {
      if (credits <= 0) {
        setShowCreditsPurchase(true);
      }
      springBack();
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    animateCardOut('right', () => {
      const bet = {
        ...currentCard,
        choice: 'YES',
        amount: 1,
        potentialPayout: (100 / currentCard.yesPrice).toFixed(2)
      };
      
      setSessionBets(prev => [...prev, bet]);
      setCredits(prev => Math.max(0, prev - 1));
      setXp(prev => prev + 10);
      updateStreak();
      
      // Save to history for undo
      setSwipeHistory(prev => [...prev, { action: 'YES', card: currentCard, index: currentCardIndex }]);
      
      moveToNextCard();
    });
  };

  const handleNo = () => {
    if (!currentCard || credits <= 0) {
      if (credits <= 0) {
        setShowCreditsPurchase(true);
      }
      springBack();
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    animateCardOut('left', () => {
      const bet = {
        ...currentCard,
        choice: 'NO',
        amount: 1,
        potentialPayout: (100 / currentCard.noPrice).toFixed(2)
      };
      
      setSessionBets(prev => [...prev, bet]);
      setCredits(prev => Math.max(0, prev - 1));
      setXp(prev => prev + 10);
      updateStreak();
      
      // Save to history for undo
      setSwipeHistory(prev => [...prev, { action: 'NO', card: currentCard, index: currentCardIndex }]);
      
      moveToNextCard();
    });
  };

  const handleSkip = () => {
    animateCardOut('up', () => {
      updateStreak();
      setSwipeHistory(prev => [...prev, { action: 'SKIP', card: currentCard, index: currentCardIndex }]);
      moveToNextCard();
    });
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0 || currentCardIndex === 0) {
      springBack();
      return;
    }
    
    animateCardOut('down', () => {
      const lastAction = swipeHistory[swipeHistory.length - 1];
      
      // Undo the last action
      if (lastAction.action === 'YES' || lastAction.action === 'NO') {
        // Remove from session bets
        setSessionBets(prev => prev.slice(0, -1));
        // Restore credit
        setCredits(prev => prev + 1);
        // Remove XP
        setXp(prev => Math.max(0, prev - 10));
      }
      
      // Remove from history
      setSwipeHistory(prev => prev.slice(0, -1));
      
      // Go back to previous card
      setCurrentCardIndex(prev => Math.max(0, prev - 1));
    });
  };

  const moveToNextCard = () => {
    if (currentCardIndex < activeCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      // After 20 cards, show checkout
      setShowCheckout(true);
    }
  };

  const loadNextBatch = () => {
    const nextBatch = currentBatch + 1;
    setCurrentBatch(nextBatch);
    setActiveCards(generateSampleBatch(nextBatch));
    setCurrentCardIndex(0);
    setShowCheckout(false);
  };

  const updateStreak = () => {
    const now = new Date();
    if (!lastSwipeTime || now.getDate() !== lastSwipeTime.getDate()) {
      setStreak(prev => prev + 1);
    }
    setLastSwipeTime(now);
  };

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLikedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentCard.id)) {
        newSet.delete(currentCard.id);
      } else {
        newSet.add(currentCard.id);
      }
      return newSet;
    });
  };

  const handleComment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Comments', 'Comments feature coming soon!');
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share', 'Share feature coming soon!');
  };

  const calculateTotalWinnings = () => {
    return sessionBets.reduce((total, bet) => {
      return total + parseFloat(bet.potentialPayout);
    }, 0).toFixed(2);
  };

  if (!currentCard && !showCheckout) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Loading predictions...</Text>
          <ActivityIndicator size="large" color={BETCHA_BLUE} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Main Card - Full Screen */}
      {currentCard && (
        <Animated.View
          style={[
            styles.cardContainer,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { rotate },
                { scale: scaleValue }
              ],
              opacity: opacityValue,
            },
          ]}
          {...panResponder.panHandlers}>
          
          <View style={styles.card}>
            {/* Background Image - Always from Kalshi or API */}
            {cardImages[currentCard.id] && (
              <Image 
                source={{ uri: cardImages[currentCard.id] }}
                style={styles.cardBackgroundImage}
                resizeMode="cover"
              />
            )}
            
            {/* Left swipe hint (RED for NO) */}
            <Animated.View 
              style={[
                styles.swipeHintLeft,
                { opacity: leftGradientOpacity }
              ]}
              pointerEvents="none">
              <LinearGradient
                colors={['rgba(255, 59, 48, 0.6)', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.swipeIndicatorLeft}>
                <Text style={styles.swipeTextNo}>NO</Text>
              </View>
            </Animated.View>
            
            {/* Right swipe hint (GREEN for YES) */}
            <Animated.View 
              style={[
                styles.swipeHintRight,
                { opacity: rightGradientOpacity }
              ]}
              pointerEvents="none">
              <LinearGradient
                colors={['transparent', 'rgba(52, 199, 89, 0.6)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.swipeIndicatorRight}>
                <Text style={styles.swipeTextYes}>YES</Text>
              </View>
            </Animated.View>
            
            {/* Content Overlay */}
            <View style={styles.cardContent}>
              {/* Category Pill */}
              <View style={[styles.categoryPill, { backgroundColor: BETCHA_BLUE }]}>
                <Text style={styles.categoryText}>{currentCard.category}</Text>
              </View>
              
              {/* Question */}
              <View style={styles.questionContainer}>
                <Text style={styles.questionText}>{currentCard.question}</Text>
              </View>
              
              {/* Prices */}
              <View style={styles.pricesContainer}>
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>NO</Text>
                  <Text style={[styles.priceValue, { color: '#FF3B30' }]}>{currentCard.noPrice}%</Text>
                </View>
                <View style={styles.priceDivider} />
                <View style={styles.priceBox}>
                  <Text style={styles.priceLabel}>YES</Text>
                  <Text style={[styles.priceValue, { color: '#34C759' }]}>{currentCard.yesPrice}%</Text>
                </View>
              </View>
            </View>
            
            {/* Bottom Section */}
            <View style={styles.bottomSection}>
              <View style={styles.interactionContainer}>
                <TouchableOpacity 
                  style={styles.interactionButton} 
                  onPress={handleLike}
                  onLongPress={handleLike}>
                  <Heart 
                    size={28} 
                    color="#FFF" 
                    fill={likedCards.has(currentCard.id) ? '#FFF' : 'none'}
                  />
                  <Text style={styles.interactionText}>2.4K</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.interactionButton} onPress={handleComment}>
                  <MessageCircle size={28} color="#FFF" />
                  <Text style={styles.interactionText}>147</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.interactionButton} onPress={handleShare}>
                  <Share2 size={28} color="#FFF" />
                  <Text style={styles.interactionText}>Share</Text>
                </TouchableOpacity>
              </View>
              
              {/* Progress Dots */}
              <View style={styles.progressContainer}>
                <View style={styles.dotsContainer}>
                  {activeCards.map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentCardIndex && styles.activeDot,
                        index < currentCardIndex && styles.completedDot
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.progressText}>
                  {currentCardIndex + 1} / {activeCards.length}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Header Overlay */}
      <View style={styles.headerOverlay}>
        <Image 
          source={require('../../assets/betcha-new-v2.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={styles.statBox}
            onPress={() => setShowCreditsPurchase(true)}
            activeOpacity={0.8}>
            <Text style={styles.statValue}>💎 {credits}</Text>
            <Text style={styles.statLabel}>CREDITS</Text>
          </TouchableOpacity>
          
          <View style={styles.statBox}>
            <Text style={styles.statValue}>⭐ {xp >= 1000 ? `${(xp/1000).toFixed(1)}K` : xp}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          
          <View style={styles.statBox}>
            <Text style={styles.statValue}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
        </View>
      </View>

      {/* Checkout Modal */}
      {showCheckout && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCheckout}>
          <View style={styles.checkoutModal}>
            <View style={styles.checkoutContent}>
              <Text style={styles.checkoutTitle}>Review Your Predictions</Text>
              <Text style={styles.checkoutSubtitle}>
                {sessionBets.length} predictions • ${sessionBets.length} total stake
              </Text>
              
              <View style={styles.winningsBox}>
                <Text style={styles.winningsLabel}>Potential Winnings</Text>
                <Text style={styles.winningsAmount}>${calculateTotalWinnings()}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.checkoutButton}
                onPress={() => {
                  // Submit to Kalshi
                  Alert.alert('Success!', 'Your predictions have been submitted!');
                  setSessionBets([]);
                  loadNextBatch();
                }}>
                <LinearGradient
                  colors={[BETCHA_BLUE, BETCHA_LIGHT_BLUE]}
                  style={styles.checkoutGradient}>
                  <Text style={styles.checkoutButtonText}>Submit Predictions</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.continueButton}
                onPress={loadNextBatch}>
                <Text style={styles.continueButtonText}>Keep Swiping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Credits Purchase Modal */}
      {showCreditsPurchase && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showCreditsPurchase}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Buy Credits</Text>
              <TouchableOpacity 
                style={styles.modalButton}
                onPress={() => {
                  setCredits(prev => prev + 100);
                  setShowCreditsPurchase(false);
                }}>
                <Text style={styles.modalButtonText}>100 Credits - $9.99</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowCreditsPurchase(false)}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cardContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
  },
  card: {
    flex: 1,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  cardBackgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  swipeHintLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  swipeHintRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  swipeIndicatorLeft: {
    position: 'absolute',
    left: 30,
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  swipeIndicatorRight: {
    position: 'absolute',
    right: 30,
    top: '50%',
    transform: [{ translateY: -20 }],
  },
  swipeTextNo: {
    color: '#FF3B30',
    fontSize: 32,
    fontWeight: '800',
  },
  swipeTextYes: {
    color: '#34C759',
    fontSize: 32,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
    padding: 20,
    paddingTop: 120,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    textShadow: '0px 2px 4px rgba(0, 0, 0, 0.5)',
  },
  pricesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceBox: {
    flex: 1,
    alignItems: 'center',
  },
  priceDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 4,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingBottom: 30,
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  interactionButton: {
    alignItems: 'center',
  },
  interactionText: {
    color: '#FFF',
    fontSize: 12,
    marginTop: 4,
  },
  progressContainer: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: BETCHA_BLUE,
    width: 12,
  },
  completedDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  headerOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoImage: {
    width: 180,
    height: 90,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 55,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 8,
    fontWeight: '600',
    marginTop: 2,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  checkoutModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkoutContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    alignItems: 'center',
  },
  checkoutTitle: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  checkoutSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    marginBottom: 20,
  },
  winningsBox: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: BETCHA_BLUE,
  },
  winningsLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 5,
  },
  winningsAmount: {
    color: BETCHA_BLUE,
    fontSize: 36,
    fontWeight: '700',
  },
  checkoutButton: {
    width: '100%',
    marginBottom: 15,
  },
  checkoutGradient: {
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  continueButton: {
    padding: 10,
  },
  continueButtonText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 30,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: BETCHA_BLUE,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  modalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 10,
  },
  modalCloseText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
});
