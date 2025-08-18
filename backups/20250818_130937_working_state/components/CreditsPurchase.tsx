// components/CreditsPurchase.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Sparkles, TrendingUp, Zap, Crown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');

interface CreditsPurchaseProps {
  visible: boolean;
  onClose: () => void;
  onPurchase: (credits: number, price: number) => void;
  currentCredits: number;
}

interface Package {
  id: string;
  credits: number;
  price: number;
  bonus: number;
  popular?: boolean;
  bestValue?: boolean;
  icon: any;
  color: string[];
}

const packages: Package[] = [
  {
    id: 'starter',
    credits: 10,
    price: 9.99,
    bonus: 0,
    icon: Sparkles,
    color: ['#6B7280', '#4B5563'],
  },
  {
    id: 'player',
    credits: 25,
    price: 24.99,
    bonus: 5,
    popular: true,
    icon: Zap,
    color: ['#00D4FF', '#0099CC'],
  },
  {
    id: 'pro',
    credits: 50,
    price: 49.99,
    bonus: 15,
    icon: TrendingUp,
    color: ['#34C759', '#28A745'],
  },
  {
    id: 'whale',
    credits: 100,
    price: 99.99,
    bonus: 40,
    bestValue: true,
    icon: Crown,
    color: ['#FFD700', '#FFA500'],
  },
];

export default function CreditsPurchase({
  visible,
  onClose,
  onPurchase,
  currentCredits,
}: CreditsPurchaseProps) {
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const handleSelectPackage = (pkg: Package) => {
    setSelectedPackage(pkg);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePurchase = async () => {
    if (!selectedPackage) return;
    
    setIsPurchasing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Simulate purchase delay
    setTimeout(() => {
      onPurchase(selectedPackage.credits + selectedPackage.bonus, selectedPackage.price);
      setIsPurchasing(false);
      setSelectedPackage(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 1500);
  };

  const getTotalCredits = (pkg: Package) => {
    return pkg.credits + pkg.bonus;
  };

  const getPricePerCredit = (pkg: Package) => {
    return (pkg.price / getTotalCredits(pkg)).toFixed(2);
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
            <Text style={styles.title}>Get Credits</Text>
            <Text style={styles.subtitle}>Power up your predictions</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#8E8E93" />
          </TouchableOpacity>
        </View>

        {/* Current Balance */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>�� {currentCredits}</Text>
            <Text style={styles.balanceSubtext}>Credits</Text>
          </View>
        </View>

        {/* Packages */}
        <ScrollView style={styles.packagesContainer} showsVerticalScrollIndicator={false}>
          {packages.map((pkg) => {
            const Icon = pkg.icon;
            const isSelected = selectedPackage?.id === pkg.id;
            
            return (
              <TouchableOpacity
                key={pkg.id}
                onPress={() => handleSelectPackage(pkg)}
                activeOpacity={0.8}>
                <LinearGradient
                  colors={isSelected ? pkg.color : ['#1C1C1E', '#2C2C2E']}
                  style={[
                    styles.packageCard,
                    isSelected && styles.selectedCard,
                  ]}>
                  
                  {/* Popular/Best Value Badge */}
                  {pkg.popular && (
                    <View style={[styles.badge, styles.popularBadge]}>
                      <Text style={styles.badgeText}>MOST POPULAR</Text>
                    </View>
                  )}
                  {pkg.bestValue && (
                    <View style={[styles.badge, styles.bestValueBadge]}>
                      <Text style={styles.badgeText}>BEST VALUE</Text>
                    </View>
                  )}
                  
                  <View style={styles.packageContent}>
                    <View style={styles.packageLeft}>
                      <View style={styles.iconContainer}>
                        <Icon size={28} color={isSelected ? '#FFF' : '#00D4FF'} />
                      </View>
                      <View>
                        <Text style={[styles.creditsAmount, isSelected && styles.selectedText]}>
                          {getTotalCredits(pkg)} Credits
                        </Text>
                        {pkg.bonus > 0 && (
                          <Text style={[styles.bonusText, isSelected && styles.selectedBonusText]}>
                            +{pkg.bonus} bonus credits
                          </Text>
                        )}
                        <Text style={[styles.perCreditText, isSelected && styles.selectedSubtext]}>
                          ${getPricePerCredit(pkg)} per credit
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.packageRight}>
                      <Text style={[styles.price, isSelected && styles.selectedText]}>
                        ${pkg.price}
                      </Text>
                      {isSelected && (
                        <View style={styles.checkmark}>
                          <Text style={styles.checkmarkText}>✓</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>��</Text>
            <Text style={styles.benefitText}>Win real money</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>⚡</Text>
            <Text style={styles.benefitText}>Instant deposits</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>��</Text>
            <Text style={styles.benefitText}>Secure checkout</Text>
          </View>
        </View>

        {/* Purchase Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.purchaseButton, !selectedPackage && styles.disabledButton]}
            onPress={handlePurchase}
            disabled={!selectedPackage || isPurchasing}
            activeOpacity={0.8}>
            <LinearGradient
              colors={selectedPackage ? ['#00D4FF', '#0099CC'] : ['#3A3A3C', '#3A3A3C']}
              style={styles.purchaseGradient}>
              {isPurchasing ? (
                <Text style={styles.purchaseText}>Processing...</Text>
              ) : selectedPackage ? (
                <Text style={styles.purchaseText}>
                  Buy {getTotalCredits(selectedPackage)} Credits for ${selectedPackage.price}
                </Text>
              ) : (
                <Text style={styles.purchaseText}>Select a Package</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          
          <Text style={styles.disclaimer}>
            Payments processed securely via Apple Pay
          </Text>
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
    fontSize: 32,
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
  balanceCard: {
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    marginHorizontal: 20,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.2)',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#00D4FF',
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#8E8E93',
  },
  packagesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  packageCard: {
    borderRadius: 16,
    marginBottom: 12,
    padding: 20,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#FFF',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  popularBadge: {
    backgroundColor: '#00D4FF',
  },
  bestValueBadge: {
    backgroundColor: '#FFD700',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 0.5,
  },
  packageContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creditsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
  },
  bonusText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
    marginBottom: 4,
  },
  selectedBonusText: {
    color: '#FFF',
  },
  perCreditText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  packageRight: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  selectedText: {
    color: '#FFF',
  },
  selectedSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  checkmark: {
    marginTop: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontWeight: '800',
  },
  benefitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1C1C1E',
  },
  benefit: {
    alignItems: 'center',
  },
  benefitIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  purchaseButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  purchaseGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  purchaseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
