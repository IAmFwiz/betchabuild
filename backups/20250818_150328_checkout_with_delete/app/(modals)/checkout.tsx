import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { X, Plus, Minus, CreditCard, Trash2 } from 'lucide-react-native';
import { useCartStore } from '../../store/cartStore';
import { useUserStore } from '../../store/userStore';
import { tokens } from '../../theme/tokens';
import * as Haptics from 'expo-haptics';

export default function CheckoutScreen() {
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems) || [];
  const clearCart = useCartStore((state) => state.clearCart);
  const updateAmount = useCartStore((state) => state.updateAmount);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const getUserStats = useUserStore((state) => state.getUserStats);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [amounts, setAmounts] = useState<{[key: string]: number}>(() => {
    const initialAmounts: {[key: string]: number} = {};
    cartItems.forEach(item => {
      initialAmounts[item.predictionId] = item.amount || 100;
    });
    return initialAmounts;
  });

  const userStats = getUserStats();
  const userBalance = userStats.credits || 10000;

  // Calculate totals
  const calculateTotals = () => {
    let totalStake = 0;
    let potentialWinnings = 0;

    cartItems.forEach(item => {
      const stake = amounts[item.predictionId] || 100;
      totalStake += stake;
      
      // Calculate potential payout based on position
      const odds = item.position === 'yes' ? item.prediction.yes_price : item.prediction.no_price;
      const payout = (stake * (100 / odds));
      potentialWinnings += payout;
    });

    const platformFee = totalStake * 0.02; // 2% fee
    const totalCost = totalStake + platformFee;
    const potentialProfit = potentialWinnings - totalCost;
    const roi = totalStake > 0 ? ((potentialProfit / totalCost) * 100).toFixed(1) : '0';

    return {
      totalStake,
      platformFee,
      totalCost,
      potentialWinnings,
      potentialProfit,
      roi
    };
  };

  const totals = calculateTotals();

  const handleAmountChange = (predictionId: string, delta: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    setAmounts(prev => {
      const currentAmount = prev[predictionId] || 100;
      const newAmount = Math.max(10, Math.min(10000, currentAmount + delta));
      
      // Update the cart store
      updateAmount(predictionId, newAmount);
      
      return {
        ...prev,
        [predictionId]: newAmount
      };
    });
  };

  const handleCustomAmount = (predictionId: string, text: string) => {
    const amount = parseInt(text) || 100;
    const clampedAmount = Math.max(10, Math.min(10000, amount));
    
    setAmounts(prev => ({
      ...prev,
      [predictionId]: clampedAmount
    }));
    
    updateAmount(predictionId, clampedAmount);
  };

  const handleDelete = (predictionId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeFromCart(predictionId);
    
    // Remove from local amounts state
    setAmounts(prev => {
      const newAmounts = { ...prev };
      delete newAmounts[predictionId];
      return newAmounts;
    });
  };

  const handleCheckout = async () => {
    if (isProcessing) return;
    
    if (totals.totalCost > userBalance) {
      Alert.alert(
        'Insufficient Balance',
        `You need $${(totals.totalCost - userBalance).toFixed(2)} more to complete this purchase.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setIsProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      // Here you would integrate with Apple Pay
      // For now, we'll simulate a successful purchase
      
      setTimeout(() => {
        Alert.alert(
          'Success!',
          `Your ${cartItems.length} predictions have been placed!`,
          [
            {
              text: 'OK',
              onPress: () => {
                clearCart();
                router.back();
              }
            }
          ]
        );
        setIsProcessing(false);
      }, 1500);
      
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
      setIsProcessing(false);
    }
  };

  const canCheckout = !isProcessing && totals.totalCost <= userBalance && cartItems.length > 0;

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Cart</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubtext}>Swipe on predictions to add them here</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back to Predictions</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>{cartItems.length} prediction{cartItems.length !== 1 ? 's' : ''}</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {cartItems.map((item) => {
          const stake = amounts[item.predictionId] || 100;
          const odds = item.position === 'yes' ? item.prediction.yes_price : item.prediction.no_price;
          const payout = (stake * (100 / odds));
          const profit = payout - stake;
          
          return (
            <View key={item.predictionId} style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemTitle} numberOfLines={2}>
                  {item.prediction.title}
                </Text>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.predictionId)}>
                  <Trash2 size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.itemDetails}>
                <View style={[
                  styles.positionBadge,
                  item.position === 'yes' ? styles.yesBadge : styles.noBadge
                ]}>
                  <Text style={styles.positionText}>
                    {item.position.toUpperCase()} @ {odds}¢
                  </Text>
                </View>
                
                <View style={styles.amountControls}>
                  <TouchableOpacity 
                    style={styles.amountButton}
                    onPress={() => handleAmountChange(item.predictionId, -10)}>
                    <Minus size={16} color="#FFF" />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.amountInput}
                    value={`$${stake}`}
                    onChangeText={(text) => handleCustomAmount(item.predictionId, text.replace('$', ''))}
                    keyboardType="numeric"
                    selectTextOnFocus
                  />
                  
                  <TouchableOpacity 
                    style={styles.amountButton}
                    onPress={() => handleAmountChange(item.predictionId, 10)}>
                    <Plus size={16} color="#FFF" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.payoutInfo}>
                <View style={styles.payoutRow}>
                  <Text style={styles.payoutLabel}>Win:</Text>
                  <Text style={styles.payoutValue}>${payout.toFixed(2)}</Text>
                </View>
                <View style={styles.payoutRow}>
                  <Text style={styles.payoutLabel}>Profit:</Text>
                  <Text style={[styles.payoutValue, styles.profitText]}>
                    +${profit.toFixed(2)}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Stake</Text>
            <Text style={styles.summaryValue}>${totals.totalStake.toFixed(2)}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee (2%)</Text>
            <Text style={styles.summaryValue}>${totals.platformFee.toFixed(2)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Cost</Text>
            <Text style={styles.totalValue}>${totals.totalCost.toFixed(2)}</Text>
          </View>
        </View>

        {/* Potential Winnings Card */}
        <LinearGradient
          colors={['#00D4FF', '#0099CC']}
          style={styles.winningsCard}>
          <Text style={styles.winningsTitle}>Potential Returns</Text>
          <Text style={styles.winningsAmount}>${totals.potentialWinnings.toFixed(2)}</Text>
          <View style={styles.roiContainer}>
            <Text style={styles.roiLabel}>Profit: ${totals.potentialProfit.toFixed(2)}</Text>
            <Text style={styles.roiLabel}>•</Text>
            <Text style={styles.roiLabel}>ROI: {totals.roi}%</Text>
          </View>
        </LinearGradient>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.footer}>
        <View style={styles.balanceInfo}>
          <Text style={styles.balanceLabel}>Your Balance:</Text>
          <Text style={styles.balanceValue}>${userBalance.toFixed(2)}</Text>
        </View>
        
        <TouchableOpacity
          style={[styles.checkoutButton, !canCheckout && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={!canCheckout}>
          <LinearGradient
            colors={canCheckout ? ['#000', '#111'] : ['#333', '#444']}
            style={styles.buttonGradient}>
            <View style={styles.applePayContainer}>
              <CreditCard size={20} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.checkoutButtonText}>
                {isProcessing ? 'Processing...' : Platform.OS === 'ios' ? ' Pay' : 'Pay Now'}
              </Text>
            </View>
            <Text style={styles.checkoutAmount}>${totals.totalCost.toFixed(2)}</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        {totals.totalCost > userBalance && (
          <Text style={styles.insufficientText}>
            Insufficient balance (need ${(totals.totalCost - userBalance).toFixed(2)} more)
          </Text>
        )}
      </View>
    </SafeAreaView>
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
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  item: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 20,
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  positionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  yesBadge: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderWidth: 1,
    borderColor: '#34C759',
  },
  noBadge: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  positionText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  amountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    minWidth: 80,
    textAlign: 'center',
  },
  payoutInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payoutLabel: {
    fontSize: 13,
    color: '#888',
  },
  payoutValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  profitText: {
    color: '#34C759',
  },
  summaryCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#888',
  },
  summaryValue: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    color: '#00D4FF',
    fontWeight: '700',
  },
  winningsCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  winningsTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  winningsAmount: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  roiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roiLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#000',
  },
  balanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#888',
  },
  balanceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  checkoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applePayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  checkoutAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  insufficientText: {
    fontSize: 13,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#00D4FF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  backButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 20,
  },
});
