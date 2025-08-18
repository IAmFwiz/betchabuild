import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { tokens } from '../../theme/tokens';
import * as Haptics from 'expo-haptics';
import { predictionService } from '../../services/predictionService';

interface CartItem {
  prediction: {
    id: string;
    title: string;
    currentOdds: {
      yes: number;
      no: number;
    };
  };
  choice: 'yes' | 'no';
  stake: number;
}

export default function CheckoutScreen() {
  const { items, totalStake, clearCart } = useCartStore();
  const { user, virtualBalance } = useUserStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate fees and potential winnings
  const platformFee = totalStake * 0.05; // 5% fee
  const depositFee = 0.99; // Per deposit
  const totalCost = totalStake + platformFee + depositFee;

  const potentialWinnings = items.reduce((sum, item) => {
    const odds = item.choice === 'yes'
      ? item.prediction.currentOdds.yes
      : item.prediction.currentOdds.no;
    return sum + (item.stake * (100 / odds));
  }, 0);

  const potentialProfit = potentialWinnings - totalCost;
  const roi = ((potentialProfit / totalCost) * 100).toFixed(1);

  const handleCheckout = async () => {
    if (isProcessing || virtualBalance < totalCost) return;
    
    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Process each prediction
      for (const item of items) {
        await predictionService.placePrediction(
          item.prediction.id,
          item.choice,
          item.stake
        );
      }

      clearCart();
      // Navigate to success screen or show success message
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Checkout error:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      // Show error message to user
    } finally {
      setIsProcessing(false);
    }
  };

  const canCheckout = !isProcessing && virtualBalance >= totalCost && items.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>{items.length} prediction{items.length !== 1 ? 's' : ''}</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {items.map((item, index) => (
          <View key={`${item.prediction.id}-${index}`} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.prediction.title}
              </Text>
              <View style={[
                styles.choiceBadge,
                item.choice === 'yes' ? styles.yesBadge : styles.noBadge
              ]}>
                <Text style={styles.choiceText}>
                  {item.choice.toUpperCase()} {
                    item.choice === 'yes'
                      ? item.prediction.currentOdds.yes
                      : item.prediction.currentOdds.no
                  }%
                </Text>
              </View>
            </View>
            <View style={styles.itemFooter}>
              <Text style={styles.stakeText}>Stake: ${item.stake.toFixed(2)}</Text>
              <Text style={styles.potentialText}>
                Potential: ${(item.stake * (100 / (item.choice === 'yes'
                  ? item.prediction.currentOdds.yes
                  : item.prediction.currentOdds.no))).toFixed(2)}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Stake</Text>
            <Text style={styles.summaryValue}>${totalStake.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee (5%)</Text>
            <Text style={styles.summaryValue}>${platformFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Processing Fee</Text>
            <Text style={styles.summaryValue}>${depositFee.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Cost</Text>
            <Text style={styles.totalValue}>${totalCost.toFixed(2)}</Text>
          </View>
          
          <View style={styles.winningsContainer}>
            <LinearGradient
              colors={['#4FC3F7', '#2DA9E0']}
              style={styles.winningsGradient}
            >
              <Text style={styles.winningsLabel}>Potential Winnings</Text>
              <Text style={styles.winningsValue}>
                ${potentialWinnings.toFixed(2)}
              </Text>
              <Text style={styles.roiText}>
                {roi}% ROI • ${potentialProfit.toFixed(2)} profit
              </Text>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.checkoutButton, !canCheckout && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={!canCheckout}
        >
          <LinearGradient
            colors={canCheckout ? ['#4FC3F7', '#2DA9E0'] : ['#9E9E9E', '#757575']}
            style={styles.buttonGradient}
          >
            <Text style={styles.checkoutButtonText}>
              {isProcessing ? 'Processing...' : `Pay $${totalCost.toFixed(2)}`}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {virtualBalance < totalCost && (
          <Text style={styles.insufficientText}>
            Insufficient balance. You need ${(totalCost - virtualBalance).toFixed(2)} more.
          </Text>
        )}

        {items.length === 0 && (
          <Text style={styles.emptyCartText}>
            Your cart is empty. Add some predictions to get started!
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.surface2,
    backgroundColor: tokens.colors.surface,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: tokens.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: tokens.colors.textSecondary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  item: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: tokens.colors.text,
    marginRight: 12,
    lineHeight: 20,
  },
  choiceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  yesBadge: {
    backgroundColor: tokens.colors.success,
  },
  noBadge: {
    backgroundColor: tokens.colors.error,
  },
  choiceText: {
    color: tokens.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stakeText: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
  },
  potentialText: {
    fontSize: 14,
    color: tokens.colors.success,
    fontWeight: '600',
  },
  summary: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: tokens.colors.textSecondary,
  },
  summaryValue: {
    fontSize: 16,
    color: tokens.colors.text,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: tokens.colors.surface2,
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    color: tokens.colors.text,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    color: tokens.colors.text,
    fontWeight: 'bold',
  },
  winningsContainer: {
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  winningsGradient: {
    padding: 20,
    alignItems: 'center',
  },
  winningsLabel: {
    fontSize: 14,
    color: tokens.colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  winningsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: tokens.colors.white,
    marginBottom: 8,
  },
  roiText: {
    fontSize: 14,
    color: tokens.colors.white,
    opacity: 0.9,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.surface2,
    backgroundColor: tokens.colors.surface,
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: tokens.colors.white,
  },
  insufficientText: {
    fontSize: 14,
    color: tokens.colors.error,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyCartText: {
    fontSize: 14,
    color: tokens.colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
