import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../theme/tokens';

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

interface CheckoutFlowProps {
  items: CartItem[];
  totalStake: number;
  onCheckout: () => void;
  onCancel: () => void;
}

export const CheckoutFlow = ({ items, totalStake, onCheckout, onCancel }: CheckoutFlowProps) => {
  const potentialWinnings = items.reduce((sum, item) => {
    const odds = item.choice === 'yes' 
      ? item.prediction.currentOdds.yes 
      : item.prediction.currentOdds.no;
    return sum + (item.stake * (100 / odds));
  }, 0);

  const platformFee = totalStake * 0.05; // 5% fee
  const depositFee = 0.99; // Per deposit
  const totalAmount = totalStake + platformFee + depositFee;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Review your predictions</Text>
      </View>
      
      <ScrollView style={styles.itemsContainer} showsVerticalScrollIndicator={false}>
        {items.map(item => (
          <View key={item.prediction.id} style={styles.item}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {item.prediction.title}
              </Text>
              <View style={[
                styles.choiceBadge,
                item.choice === 'yes' ? styles.yesBadge : styles.noBadge
              ]}>
                <Text style={styles.choiceText}>
                  {item.choice.toUpperCase()}
                </Text>
              </View>
            </View>
            
            <View style={styles.itemDetails}>
              <Text style={styles.stakeText}>Stake: ${item.stake}</Text>
              <Text style={styles.oddsText}>
                Odds: {item.choice === 'yes' 
                  ? item.prediction.currentOdds.yes 
                  : item.prediction.currentOdds.no}¢
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Stake:</Text>
          <Text style={styles.summaryValue}>${totalStake.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Platform Fee (5%):</Text>
          <Text style={styles.summaryValue}>${platformFee.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Deposit Fee:</Text>
          <Text style={styles.summaryValue}>${depositFee.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalValue}>${totalAmount.toFixed(2)}</Text>
        </View>
        
        <View style={[styles.summaryRow, styles.winningsRow]}>
          <Text style={styles.winningsLabel}>Potential Winnings:</Text>
          <Text style={styles.winningsValue}>${potentialWinnings.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.checkoutButton} onPress={onCheckout}>
          <LinearGradient
            colors={[tokens.colors.blue, tokens.colors.blueStrong]}
            style={styles.checkoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.checkoutButtonText}>
              Pay ${totalAmount.toFixed(2)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: tokens.colors.outline,
  },
  title: {
    fontSize: tokens.typography.sizes.xxxl,
    fontWeight: tokens.typography.weights.heavy,
    color: tokens.colors.color,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.md,
    color: tokens.colors.color3,
  },
  itemsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  item: {
    backgroundColor: tokens.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: tokens.colors.outline,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.color,
    marginRight: 12,
  },
  choiceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  yesBadge: {
    backgroundColor: tokens.colors.blue,
  },
  noBadge: {
    backgroundColor: tokens.colors.red,
  },
  choiceText: {
    color: tokens.colors.background,
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.bold,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stakeText: {
    color: tokens.colors.color2,
    fontSize: tokens.typography.sizes.sm,
  },
  oddsText: {
    color: tokens.colors.color2,
    fontSize: tokens.typography.sizes.sm,
  },
  summary: {
    padding: 20,
    backgroundColor: tokens.colors.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.outline,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    color: tokens.colors.color2,
    fontSize: tokens.typography.sizes.md,
  },
  summaryValue: {
    color: tokens.colors.color,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: tokens.colors.outline,
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    color: tokens.colors.color,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
  totalValue: {
    color: tokens.colors.color,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
  winningsRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.outline,
  },
  winningsLabel: {
    color: tokens.colors.gold,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
  winningsValue: {
    color: tokens.colors.gold,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: tokens.colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: tokens.colors.color2,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.bold,
  },
  checkoutButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkoutGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkoutButtonText: {
    color: tokens.colors.background,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.bold,
  },
});
