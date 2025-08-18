// components/BetAmountSelector.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, DollarSign } from 'lucide-react-native';

interface BetAmountSelectorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  currentBalance: number;
  minBet?: number;
  maxBet?: number;
}

export default function BetAmountSelector({
  visible,
  onClose,
  onConfirm,
  currentBalance,
  minBet = 1,
  maxBet = 1000,
}: BetAmountSelectorProps) {
  const [amount, setAmount] = useState('10');
  const [customAmount, setCustomAmount] = useState('');
  const [isCustom, setIsCustom] = useState(false);

  const quickAmounts = [5, 10, 25, 50, 100, 250];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmount = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    setCustomAmount(numericValue);
    setAmount(numericValue);
    setIsCustom(true);
  };

  const handleConfirm = () => {
    const betAmount = parseInt(amount);
    if (betAmount >= minBet && betAmount <= Math.min(maxBet, currentBalance)) {
      onConfirm(betAmount);
      onClose();
    }
  };

  const getAmountError = () => {
    const betAmount = parseInt(amount);
    if (!amount || betAmount < minBet) return `Minimum bet is $${minBet}`;
    if (betAmount > currentBalance) return 'Insufficient balance';
    if (betAmount > maxBet) return `Maximum bet is $${maxBet}`;
    return null;
  };

  const error = getAmountError();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose} 
        />
        
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Select Bet Amount</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Current Balance */}
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>${currentBalance.toLocaleString()}</Text>
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountsGrid}>
            {quickAmounts.map((value) => (
              <TouchableOpacity
                key={value}
                style={[
                  styles.quickAmountButton,
                  amount === value.toString() && !isCustom && styles.selectedButton,
                  value > currentBalance && styles.disabledButton,
                ]}
                onPress={() => handleQuickAmount(value)}
                disabled={value > currentBalance}>
                <Text style={[
                  styles.quickAmountText,
                  amount === value.toString() && !isCustom && styles.selectedText,
                  value > currentBalance && styles.disabledText,
                ]}>
                  ${value}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Amount Input */}
          <View style={styles.customInputContainer}>
            <View style={styles.inputWrapper}>
              <DollarSign size={20} color="#8E8E93" style={styles.dollarIcon} />
              <TextInput
                style={styles.customInput}
                placeholder="Enter custom amount"
                placeholderTextColor="#666"
                value={customAmount}
                onChangeText={handleCustomAmount}
                keyboardType="numeric"
                onFocus={() => setIsCustom(true)}
              />
            </View>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Selected Amount Display */}
          <View style={styles.selectedAmountContainer}>
            <Text style={styles.selectedAmountLabel}>You're betting</Text>
            <Text style={styles.selectedAmount}>
              ${amount || '0'}
            </Text>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmButton, error && styles.disabledConfirmButton]}
            onPress={handleConfirm}
            disabled={!!error}>
            <LinearGradient
              colors={error ? ['#3A3A3C', '#3A3A3C'] : ['#00D4FF', '#0099CC']}
              style={styles.confirmGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}>
              <Text style={styles.confirmText}>Confirm Bet</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  content: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  balanceContainer: {
    backgroundColor: '#2C2C2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#34C759',
  },
  quickAmountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickAmountButton: {
    width: '31%',
    backgroundColor: '#2C2C2E',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#00D4FF',
  },
  disabledButton: {
    opacity: 0.4,
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  selectedText: {
    color: '#000',
  },
  disabledText: {
    color: '#666',
  },
  customInputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  dollarIcon: {
    position: 'absolute',
    left: 16,
    top: 18,
    zIndex: 1,
  },
  customInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 44,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  selectedAmountContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  selectedAmountLabel: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  selectedAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#00D4FF',
  },
  confirmButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  disabledConfirmButton: {
    opacity: 0.5,
  },
  confirmGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
});
