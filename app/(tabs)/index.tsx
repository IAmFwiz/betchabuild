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
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import kalshiService from '../../services/kalshiService';
import CreditsPurchase from '../../components/CreditsPurchase';
import SessionCheckout from '../../components/SessionCheckout';
import DailyXPClaim from '../../components/DailyXPClaim';
import * as Haptics from 'expo-haptics';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Theme color from Betcha logo
const BETCHA_BLUE = '#00D4FF';
const BETCHA_LIGHT_BLUE = '#00E5FF';

// Inline function - no import needed
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    MUSIC: '#FF2D55',
    ENTERTAINMENT: '#FF2D55',
    HOLLYWOOD: '#9C27B0',
    FASHION: '#E91E63',
    SPORTS: '#FF6B00',
    DEFAULT: BETCHA_BLUE,
  };
  return colors[category] || colors.DEFAULT;
};

// Entertainment-focused sample data
const sampleBets = [
  {
    id: 1,
    category: 'MUSIC',
    question: 'Will Taylor Swift announce a new album this month?',
    yesPrice: 65,
    noPrice: 35,
    totalVolume: '$89.2K',
    imageUrl: null,
    endDate: '2025-08-31',
    details: "With the Eras Tour ending, fans are speculating Taylor is ready to drop new music. Historical patterns suggest announcement timing."
  },
  {
    id: 2,
    category: 'ENTERTAINMENT',
    question: 'Will Marvel announce a new Avengers movie at Comic-Con?',
    yesPrice: 72,
    noPrice: 28,
    totalVolume: '$145.3K',
    imageUrl: null,
    endDate: '2025-08-25',
    details: "Industry insiders hint at major MCU announcements. Phase 6 needs a tentpole film."
  },
  {
    id: 3,
    category: 'SPORTS',
    question: 'Will the Lakers make the playoffs?',
    yesPrice: 58,
    noPrice: 42,
    totalVolume: '$234.7K',
    imageUrl: null,
    endDate: '2025-09-15',
    details: "LeBron's final seasons. Team chemistry questions. Western Conference is loaded."
  },
  {
    id: 4,
    category: 'HOLLYWOOD',
    question: 'Will Barbie win Best Picture at the Oscars?',
    yesPrice: 45,
    noPrice: 55,
    totalVolume: '$567.2K',
    imageUrl: null,
    endDate: '2025-09-10',
    details: "Cultural phenomenon vs traditional Academy preferences. Greta Gerwig's vision resonated globally."
  },
  {
    id: 5,
    category: 'FASHION',
    question: 'Will Kim K launch a new SKIMS collection this quarter?',
    yesPrice: 81,
    noPrice: 19,
    totalVolume: '$67.4K',
    imageUrl: null,
    endDate: '2025-09-30',
    details: "SKIMS expansion continues. Recent trademark filings suggest new categories."
  }
];

export default function HomeScreen() {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [credits, setCredits] = useState(50);
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionBets, setSessionBets] = useState<any[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCreditsPurchase, setShowCreditsPurchase] = useState(false);
  const [showDailyXP, setShowDailyXP] = useState(false);
  const [activeCards, setActiveCards] = useState(sampleBets);
  const [isLoadingReal, setIsLoadingReal] = useState(false);
  const [likedCards, setLikedCards] = useState<Set<number>>(new Set());
  const [lastSwipeTime, setLastSwipeTime] = useState<Date | null>(null);
  
  const pan = useRef(new Animated.ValueXY()).current;
  const rotateValue = useRef(new Animated.Value(0)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const isAnimating = useRef(false);
  
  const currentCard = activeCards[currentCardIndex];

  const rotate = rotateValue.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
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
        
        // Determine if this is primarily a horizontal or vertical swipe
        const isHorizontal = absX > absY;
        
        // Thresholds for triggering actions
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
          } else if (gestureState.dy > 0 && currentCardIndex > 0) {
            // Swipe Down - Previous
            handlePrevious();
          } else {
            // Spring back if can't go to previous
            springBack();
          }
        } else {
          // Not enough movement, spring back
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
      // Reset animation values
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
      
      if (currentCardIndex < activeCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setCurrentCardIndex(0);
      }
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
      
      if (currentCardIndex < activeCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setCurrentCardIndex(0);
      }
    });
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    animateCardOut('up', () => {
      updateStreak();
      if (currentCardIndex < activeCards.length - 1) {
        setCurrentCardIndex(prev => prev + 1);
      } else {
        setCurrentCardIndex(0);
      }
    });
  };

  const handlePrevious = () => {
    if (currentCardIndex === 0) {
      springBack();
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    animateCardOut('down', () => {
      setCurrentCardIndex(prev => Math.max(0, prev - 1));
    });
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

  if (!currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No more predictions!</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={() => setCurrentCardIndex(0)}>
            <Text style={styles.refreshText}>Start Over</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header with Logo and Stats - Positioned Lower */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/betcha-new-v2.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        
        <View style={styles.statsContainer}>
          {/* Credits */}
          <TouchableOpacity 
            style={styles.statBox}
            onPress={() => setShowCreditsPurchase(true)}
            activeOpacity={0.8}>
            <Text style={styles.statEmoji}>��</Text>
            <Text style={styles.statValue}>{credits}</Text>
            <Text style={styles.statLabel}>CREDITS</Text>
          </TouchableOpacity>
          
          {/* XP */}
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{xp.toLocaleString()}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          
          {/* Streak */}
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>��</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
        </View>
      </View>

      {/* Main Card - Goes all the way to top */}
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
        
        {/* Card with blue top border */}
        <View style={styles.card}>
          <View style={styles.cardTopBorder} />
          
          {/* Card Image/Content Area */}
          <LinearGradient
            colors={[getCategoryColor(currentCard.category), '#000']}
            style={styles.cardGradient}>
            
            {/* Category Pill */}
            <View style={styles.categoryPill}>
              <Text style={styles.categoryText}>{currentCard.category}</Text>
            </View>
            
            {/* Question */}
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{currentCard.question}</Text>
            </View>
            
            {/* Prices */}
            <View style={styles.pricesContainer}>
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>YES</Text>
                <Text style={styles.priceValue}>{currentCard.yesPrice}%</Text>
              </View>
              <View style={styles.priceDivider} />
              <View style={styles.priceBox}>
                <Text style={styles.priceLabel}>NO</Text>
                <Text style={styles.priceValue}>{currentCard.noPrice}%</Text>
              </View>
            </View>
            
            {/* Volume */}
            <Text style={styles.volumeText}>Volume: {currentCard.totalVolume}</Text>
          </LinearGradient>
          
          {/* Interaction Buttons */}
          <View style={styles.interactionContainer}>
            <TouchableOpacity 
              style={styles.interactionButton} 
              onPress={handleLike}
              onLongPress={handleLike}>
              <Heart 
                size={28} 
                color={likedCards.has(currentCard.id) ? '#FF2D55' : '#FFF'} 
                fill={likedCards.has(currentCard.id) ? '#FF2D55' : 'none'}
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
          
          {/* Card Progress Dots */}
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
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.noButton]} 
          onPress={handleNo}
          disabled={credits <= 0}>
          <Text style={styles.actionButtonText}>NO</Text>
          <Text style={styles.actionButtonPercent}>{currentCard.noPrice}%</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.yesButton]} 
          onPress={handleYes}
          disabled={credits <= 0}>
          <Text style={styles.actionButtonText}>YES</Text>
          <Text style={styles.actionButtonPercent}>{currentCard.yesPrice}%</Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      {showCreditsPurchase && (
        <CreditsPurchase 
          onClose={() => setShowCreditsPurchase(false)}
          onPurchase={(amount) => {
            setCredits(prev => prev + amount);
            setShowCreditsPurchase(false);
          }}
        />
      )}
      
      {showCheckout && sessionBets.length > 0 && (
        <SessionCheckout
          bets={sessionBets}
          onClose={() => setShowCheckout(false)}
          onConfirm={() => {
            setSessionBets([]);
            setShowCheckout(false);
          }}
        />
      )}
      
      {showDailyXP && (
        <DailyXPClaim
          onClaim={(amount) => {
            setXp(prev => prev + amount);
            setShowDailyXP(false);
          }}
          onClose={() => setShowDailyXP(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    position: 'absolute',
    top: 60, // Moved down from top
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoImage: {
    width: 120, // 3x bigger
    height: 60,
    marginLeft: -10,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  statValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  cardContainer: {
    position: 'absolute',
    top: 0, // Card starts at very top
    left: 20,
    right: 20,
    bottom: 100,
    zIndex: 50,
  },
  card: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardTopBorder: {
    height: 2,
    backgroundColor: BETCHA_BLUE,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
  questionContainer: {
    marginBottom: 30,
  },
  questionText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
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
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  priceValue: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '700',
  },
  volumeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    textAlign: 'center',
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    backgroundColor: BETCHA_BLUE,
    width: 18,
  },
  completedDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  progressText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 15,
    zIndex: 60,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noButton: {
    backgroundColor: '#FF3B30',
  },
  yesButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  actionButtonPercent: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
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
  refreshButton: {
    backgroundColor: BETCHA_BLUE,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  refreshText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
