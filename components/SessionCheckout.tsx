// components/SessionCheckout.tsx

import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface SessionCheckoutProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
  sessionBets: any[];
  isCreditsMode: boolean;
  totalSpent: number;
}

export default function SessionCheckout({
  visible,
  onClose,
  onSubmit,
  sessionBets,
  isCreditsMode,
  totalSpent,
}: SessionCheckoutProps) {
  
  const calculatePotentialWinnings = () => {
    return sessionBets.reduce((total, bet) => {
      const potentialWin = (100 / bet.odds) * bet.amount;
      return total + potentialWin;
    }, 0);
  };

  const handleSubmit = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000', '#111']}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Session Complete! ��</Text>
            <Text style={styles.subtitle}>Review your predictions</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Predictions</Text>
            <Text style={styles.statValue}>{sessionBets.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>
              {isCreditsMode ? 'Credits Spent' : 'XP Used'}
            </Text>
            <Text style={styles.statValue}>
              {isCreditsMode ? '💎' : '⭐️'} {totalSpent}
            </Text>
          </View>
          {isCreditsMode && (
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Potential Win</Text>
              <Text style={[styles.statValue, styles.winAmount]}>
                ${calculatePotentialWinnings().toFixed(2)}
              </Text>
            </View>
          )}
        </View>

        {/* Predictions List */}
        <ScrollView style={styles.betsList} showsVerticalScrollIndicator={false}>
          {sessionBets.map((bet, index) => (
            <View key={index} style={styles.betItem}>
              <View style={styles.betNumber}>
                <Text style={styles.betNumberText}>{index + 1}</Text>
              </View>
              <View style={styles.betContent}>
                <Text style={styles.betQuestion} numberOfLines={2}>
                  {bet.question}
                </Text>
                <View style={styles.betDetails}>
                  <View style={[
                    styles.betSide,
                    { backgroundColor: bet.side === 'yes' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 59, 48, 0.2)' }
                  ]}>
                    <Text style={[
                      styles.betSideText,
                      { color: bet.side === 'yes' ? '#34C759' : '#FF3B30' }
                    ]}>
                      {bet.side.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.betOdds}>{bet.odds}%</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}>
            <LinearGradient
              colors={['#00D4FF', '#0099CC']}
              style={styles.submitGradient}>
              <Check size={20} color="#FFF" />
              <Text style={styles.submitText}>
                {isCreditsMode ? 'Submit Predictions' : 'Lock In For XP'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  closeButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  winAmount: {
    color: '#34C759',
  },
  betsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  betItem: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  betNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  betNumberText: {
    color: '#00D4FF',
    fontSize: 14,
    fontWeight: '700',
  },
  betContent: {
    flex: 1,
  },
  betQuestion: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 8,
    lineHeight: 20,
  },
  betDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  betSide: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  betSideText: {
    fontSize: 11,
    fontWeight: '700',
  },
  betOdds: {
    fontSize: 12,
    color: '#8E8E93',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  submitButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  submitGradient: {
    flexDirection: 'row',
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});
