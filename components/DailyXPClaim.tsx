// components/DailyXPClaim.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface DailyXPClaimProps {
  visible: boolean;
  onClaim: (amount: number) => void;
  onClose: () => void;
}

export default function DailyXPClaim({ visible, onClaim, onClose }: DailyXPClaimProps) {
  const [claimed, setClaimed] = useState(false);
  const scaleAnim = new Animated.Value(0.8);
  const rotateAnim = new Animated.Value(0);

  const XP_AMOUNT = 1000;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClaim = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // Animate the gift
    Animated.parallel([
      Animated.spring(rotateAnim, {
        toValue: 1,
        friction: 2,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setClaimed(true);
      onClaim(XP_AMOUNT);
      setTimeout(() => {
        onClose();
        setClaimed(false);
        scaleAnim.setValue(0.8);
        rotateAnim.setValue(0);
      }, 1500);
    });
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.container,
            { transform: [{ scale: scaleAnim }] }
          ]}>
          <LinearGradient
            colors={['#1C1C1E', '#2C2C2E']}
            style={styles.gradient}>
            
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}>
              <X size={20} color="#8E8E93" />
            </TouchableOpacity>

            <Animated.View 
              style={[
                styles.giftContainer,
                { transform: [{ rotate: spin }] }
              ]}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.giftGradient}>
                <Gift size={50} color="#FFF" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.title}>Daily XP Bonus!</Text>
            <Text style={styles.subtitle}>Claim your free XP to keep playing</Text>

            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>⭐️ {XP_AMOUNT.toLocaleString()} XP</Text>
            </View>

            {!claimed ? (
              <TouchableOpacity
                style={styles.claimButton}
                onPress={handleClaim}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500']}
                  style={styles.claimGradient}>
                  <Text style={styles.claimText}>Claim Now</Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.claimedContainer}>
                <Text style={styles.claimedText}>✓ Claimed!</Text>
              </View>
            )}

            <Text style={styles.footer}>Come back tomorrow for more!</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: screenWidth * 0.85,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 30,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    padding: 5,
  },
  giftContainer: {
    marginBottom: 20,
  },
  giftGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 20,
    textAlign: 'center',
  },
  amountContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFD700',
  },
  claimButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 15,
  },
  claimGradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  claimText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  claimedContainer: {
    paddingVertical: 16,
    marginBottom: 15,
  },
  claimedText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#34C759',
  },
  footer: {
    fontSize: 12,
    color: '#666',
  },
});
