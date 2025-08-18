import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useCartStore } from '../../store/cartStore';
import { tokens } from '../../theme/tokens';

export function CartFloatingButton() {
  const { items, totalStake, checkout } = useCartStore();

  const handleCheckout = async () => {
    try {
      await checkout();
      // You could add a success notification here
    } catch (error) {
      console.error('Checkout failed:', error);
      // You could add an error notification here
    }
  };

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleCheckout}>
        <View style={styles.content}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{items.length}</Text>
          </View>
          <Text style={styles.text}>Place Bets</Text>
          <Text style={styles.stake}>${totalStake}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 1000,
  },
  button: {
    backgroundColor: tokens.colors.blue,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 140,
    ...tokens.shadows?.elevation || {
      shadowColor: tokens.colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    backgroundColor: tokens.colors.red,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: tokens.colors.background,
    fontSize: 12,
    fontWeight: '700',
  },
  text: {
    color: tokens.colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  stake: {
    color: tokens.colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});
