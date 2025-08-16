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

// Inline function - no import needed
const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    MUSIC: '#FF2D55',
    ENTERTAINMENT: '#FF2D55',
    HOLLYWOOD: '#9C27B0',
    FASHION: '#E91E63',
    SPORTS: '#FF6B00',
    DEFAULT: '#00D4FF',
  };
  return colors[category] || colors.DEFAULT;
};

// Entertainment-focused sample data (20 cards)
const sampleBets = [
  {
    id: 1,
    category: 'MUSIC',
    question: 'Will Taylor Swift announce a new album this month?',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    yesPercentage: 72,
    noPercentage: 28,
  },
  {
    id: 2,
    category: 'HOLLYWOOD',
    question: 'Will the new Marvel movie cross $1B globally?',
    image: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
    yesPercentage: 85,
    noPercentage: 15,
  },
  {
    id: 3,
    category: 'FASHION',
    question: 'Will oversized blazers trend this fall?',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800',
    yesPercentage: 61,
    noPercentage: 39,
  },
  {
    id: 4,
    category: 'ENTERTAINMENT',
    question: 'Will Netflix stock hit $500 this quarter?',
    image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800',
    yesPercentage: 43,
    noPercentage: 57,
  },
  {
    id: 5,
    category: 'MUSIC',
    question: 'Will Beyoncé win Album of the Year?',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800',
    yesPercentage: 68,
    noPercentage: 32,
  },
];

export default function HomeTab() {
  // Currency states
  const [credits, setCredits] = useState(0);
  const [xp, setXp] = useState(1000);
  const [streak, setStreak] = useState(0);
  
  // Card states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionBets, setSessionBets] = useState<any[]>([]);
  const [likedCards, setLikedCards] = useState<string[]>([]);
  const [lastTap, setLastTap] = useState(0);
  
  // Modal states
  const [showCreditsPurchase, setShowCreditsPurchase] = useState(false);
  const [showSessionCheckout, setShowSessionCheckout] = useState(false);
  const [showDailyXP, setShowDailyXP] = useState(false);
  
  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const likeScale = useRef(new Animated.Value(0)).current;
  const chargeProgress = useRef(new Animated.Value(0)).current;
  const rotateCard = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ['-8deg', '0deg', '8deg'],
  });
  
  // Format large numbers to be compact
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return (num / 1000).toFixed(0) + 'K';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  const currentBet = bets[currentCardIndex];
  
  // Load markets and user data on mount
  useEffect(() => {
    loadMarkets();
    checkDailyXP();
    loadUserData();
  }, []);
  
  // Save user data whenever it changes
  useEffect(() => {
    saveUserData();
  }, [credits, xp, streak]);
  
  const loadUserData = async () => {
    try {
      const savedCredits = await AsyncStorage.getItem('userCredits');
      const savedXP = await AsyncStorage.getItem('userXP');
      const savedStreak = await AsyncStorage.getItem('userStreak');
      const savedLikes = await AsyncStorage.getItem('likedCards');
      
      if (savedCredits !== null) setCredits(parseInt(savedCredits));
      if (savedXP !== null) setXp(parseInt(savedXP));
      if (savedStreak !== null) setStreak(parseInt(savedStreak));
      if (savedLikes !== null) setLikedCards(JSON.parse(savedLikes));
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };
  
  const saveUserData = async () => {
    try {
      await AsyncStorage.setItem('userCredits', credits.toString());
      await AsyncStorage.setItem('userXP', xp.toString());
      await AsyncStorage.setItem('userStreak', streak.toString());
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };
  
  const loadMarkets = async () => {
    setLoading(true);
    try {
      const markets = await kalshiService.getMarkets();
      setBets(markets.length > 0 ? markets : sampleBets);
    } catch (error) {
      console.error('Error loading markets:', error);
      setBets(sampleBets);
    } finally {
      setLoading(false);
    }
  };
  
  const checkDailyXP = async () => {
    try {
      const lastClaim = await AsyncStorage.getItem('lastXPClaim');
      const today = new Date().toDateString();
      if (lastClaim !== today) {
        setShowDailyXP(true);
      }
    } catch (error) {
      console.error('Error checking daily XP:', error);
    }
  };

  // Pan responder with more sensitive swipe detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        const { dx, dy, vx, vy } = gesture;
        const velocity = Math.sqrt(vx * vx + vy * vy);
        
        // Very sensitive swipe detection with velocity
        if (dx > 30 || vx > 0.5) {
          // Swipe right - YES
          handleSwipe('yes');
        } else if (dx < -30 || vx < -0.5) {
          // Swipe left - NO
          handleSwipe('no');
        } else if (dy < -30 || vy < -0.5) {
          // Swipe up - SKIP
          handleSkip();
        } else if (dy > 30 && currentCardIndex > 0) {
          // Swipe down - GO BACK
          handleGoBack();
        } else {
          // Spring back
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleSwipe = async (side: 'yes' | 'no') => {
    if (!currentBet) return;
    
    const cost = 1;
    
    // Check currency
    if (credits < cost) {
      setShowCreditsPurchase(true);
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }).start();
      return;
    }
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Add to session
    const newBet = {
      betId: currentBet.id,
      side,
      amount: cost,
      question: currentBet.question,
      category: currentBet.category,
      odds: side === 'yes' ? currentBet.yesPercentage : currentBet.noPercentage,
    };
    
    const updatedSession = [...sessionBets, newBet];
    setSessionBets(updatedSession);
    
    // Update currency
    setCredits(prev => prev - cost);
    setXp(prev => prev + 100);
    setStreak(prev => prev + 1);
    
    // Update progress
    Animated.timing(chargeProgress, {
      toValue: updatedSession.length / 20,
      duration: 300,
      useNativeDriver: false,
    }).start();
    
    // Animate card off
    const targetX = side === 'yes' ? screenWidth * 1.5 : -screenWidth * 1.5;
    Animated.timing(position, {
      toValue: { x: targetX, y: 0 },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      
      if (updatedSession.length >= 20) {
        handleSessionComplete();
      } else {
        nextCard();
      }
    });
  };

  const handleSkip = () => {
    if (!currentBet) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Animated.timing(position, {
      toValue: { x: 0, y: -screenHeight },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      position.setValue({ x: 0, y: 0 });
      nextCard();
    });
  };

  const handleGoBack = () => {
    if (currentCardIndex === 0) {
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        friction: 5,
        useNativeDriver: true,
      }).start();
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.timing(position, {
      toValue: { x: 0, y: screenHeight },
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCurrentCardIndex(prev => Math.max(0, prev - 1));
      position.setValue({ x: 0, y: 0 });
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < 300) {
      // Double tap detected
      handleLike();
    }
    setLastTap(now);
  };

  const handleLike = async () => {
    if (!currentBet) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate heart
    Animated.sequence([
      Animated.spring(likeScale, {
        toValue: 1.2,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Save liked card
    const updatedLikes = [...likedCards, currentBet.id];
    setLikedCards(updatedLikes);
    await AsyncStorage.setItem('likedCards', JSON.stringify(updatedLikes));
  };

  const handleComment = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Comments', 'Comments feature coming soon!');
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share', 'Share feature coming soon!');
  };

  const handleSessionComplete = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setShowSessionCheckout(true);
  };

  const handleSessionSubmit = () => {
    setSessionBets([]);
    chargeProgress.setValue(0);
    setCurrentCardIndex(0);
    setShowSessionCheckout(false);
    Alert.alert('Success!', 'Your predictions have been submitted!');
  };

  const nextCard = () => {
    if (currentCardIndex < bets.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    } else {
      setCurrentCardIndex(0);
    }
  };

  const handlePurchase = (creditsAmount: number, price: number) => {
    setCredits(prev => prev + creditsAmount);
    setShowCreditsPurchase(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleClaimXP = async (amount: number) => {
    setXp(prev => prev + amount);
    setShowDailyXP(false);
    try {
      await AsyncStorage.setItem('lastXPClaim', new Date().toDateString());
    } catch (error) {
      console.error('Error saving XP claim date:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#00D4FF" />
        <Text style={styles.loadingText}>Loading entertainment markets...</Text>
      </View>
    );
  }

  if (!currentBet) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.emptyText}>No markets available</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadMarkets}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLiked = likedCards.includes(currentBet.id);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../../assets/betcha-new-v2.png')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.statsContainer}>
          <TouchableOpacity 
            style={[styles.statBox, styles.creditsBox]}
            onPress={() => setShowCreditsPurchase(true)}
            activeOpacity={0.8}>
            <Text style={styles.statValue} numberOfLines={1}>�� {formatNumber(credits)}</Text>
            <Text style={styles.statLabel}>CREDITS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statBox, styles.xpBox]}
            onPress={() => setShowDailyXP(true)}
            activeOpacity={0.8}>
            <Text style={styles.statValue} numberOfLines={1}>⭐️ {formatNumber(xp)}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </TouchableOpacity>
          
          <View style={[styles.statBox, styles.streakBox]}>
            <Text style={styles.statValue} numberOfLines={1}>�� {formatNumber(streak)}</Text>
            <Text style={styles.statLabel}>STREAK</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              {
                width: chargeProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }
            ]}
          />
        </View>
        <Text style={styles.progressText}>{sessionBets.length + 1}/20</Text>
      </View>

      {/* Card */}
      <TouchableOpacity 
        activeOpacity={1}
        onPress={handleDoubleTap}
        style={styles.cardContainer}>
        <Animated.View 
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: rotateCard },
              ],
            },
          ]}
          {...panResponder.panHandlers}>
          
          {/* Card Actions - Overlaid on top right */}
          <View style={styles.cardActions}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleLike}
              activeOpacity={0.7}>
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Heart 
                  size={24} 
                  color={isLiked ? '#FF3B30' : '#FFF'}
                  fill={isLiked ? '#FF3B30' : 'none'}
                />
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleComment}
              activeOpacity={0.7}>
              <MessageCircle size={24} color="#FFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
              activeOpacity={0.7}>
              <Share2 size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.imageContainer}>
            <Image source={{ uri: currentBet.image }} style={styles.cardImage} />
            
            <LinearGradient
              colors={['rgba(255, 59, 48, 0.2)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.3, y: 0 }}
              style={styles.leftGradient}
            />
            
            <LinearGradient
              colors={['transparent', 'rgba(52, 199, 89, 0.2)']}
              start={{ x: 0.7, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.rightGradient}
            />
          </View>
          
          <View style={styles.cardContent}>
            <View 
              style={[
                styles.categoryBadge,
                { backgroundColor: getCategoryColor(currentBet.category) }
              ]}>
              <Text style={styles.categoryText}>{currentBet.category}</Text>
            </View>
            
            <Text style={styles.question}>{currentBet.question}</Text>
            
            <View style={styles.percentagesContainer}>
              <View style={styles.noPercentage}>
                <Text style={styles.noPercentageLabel}>NO</Text>
                <Text style={styles.noPercentageValue}>{currentBet.noPercentage}%</Text>
              </View>
              <View style={styles.yesPercentage}>
                <Text style={styles.yesPercentageLabel}>YES</Text>
                <Text style={styles.yesPercentageValue}>{currentBet.yesPercentage}%</Text>
              </View>
            </View>
          </View>
          
          {/* Swipe indicators */}
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.yesIndicator,
              {
                opacity: position.x.interpolate({
                  inputRange: [0, 50],
                  outputRange: [0, 1],
                  extrapolate: 'clamp',
                }),
              },
            ]}>
            <Text style={styles.swipeText}>YES</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.noIndicator,
              {
                opacity: position.x.interpolate({
                  inputRange: [-50, 0],
                  outputRange: [1, 0],
                  extrapolate: 'clamp',
                }),
              },
            ]}>
            <Text style={styles.swipeText}>NO</Text>
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
      
      {/* Modals */}
      <CreditsPurchase
        visible={showCreditsPurchase}
        onClose={() => setShowCreditsPurchase(false)}
        onPurchase={handlePurchase}
        currentCredits={credits}
      />
      
      <SessionCheckout
        visible={showSessionCheckout}
        onClose={() => setShowSessionCheckout(false)}
        onSubmit={handleSessionSubmit}
        sessionBets={sessionBets}
        isCreditsMode={true}
        totalSpent={sessionBets.length}
      />
      
      <DailyXPClaim
        visible={showDailyXP}
        onClaim={handleClaimXP}
        onClose={() => setShowDailyXP(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  logoImage: {
    width: 120,
    height: 50,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statBox: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    minWidth: 50,
    maxWidth: 65,
  },
  creditsBox: {
    backgroundColor: 'rgba(0, 212, 255, 0.15)',
  },
  xpBox: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
  },
  streakBox: {
    backgroundColor: 'rgba(255, 149, 0, 0.2)',
  },
  statValue: {
    fontSize: 12,
    color: '#000',
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 7,
    color: '#666',
    marginTop: 1,
    letterSpacing: 0.2,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FFF',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  progressText: {
    color: '#666',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 6,
  },
  cardContainer: {
    flex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  cardActions: {
    position: 'absolute',
    top: 20,
    right: 15,
    flexDirection: 'row',
    gap: 15,
    zIndex: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
  leftGradient: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  rightGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  cardContent: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    lineHeight: 28,
    marginBottom: 20,
  },
  percentagesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noPercentage: {
    alignItems: 'center',
  },
  yesPercentage: {
    alignItems: 'center',
  },
  noPercentageLabel: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
    marginBottom: 4,
  },
  yesPercentageLabel: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginBottom: 4,
  },
  noPercentageValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF3B30',
  },
  yesPercentageValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#34C759',
  },
  swipeIndicator: {
    position: 'absolute',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 3,
  },
  yesIndicator: {
    top: '45%',
    right: 20,
    borderColor: '#34C759',
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
  },
  noIndicator: {
    top: '45%',
    left: 20,
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  swipeText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#00D4FF',
    borderRadius: 20,
  },
  retryText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
