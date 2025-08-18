import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../theme/tokens';

export default function OnboardingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[tokens.colors.background, tokens.colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome to Betcha</Text>
          <Text style={styles.subtitle}>The future of prediction betting</Text>
          <Text style={styles.description}>
            Swipe through predictions, place bets, and win big with our AI-powered platform.
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: tokens.typography.sizes.giant,
    fontWeight: tokens.typography.weights.heavy,
    color: tokens.colors.blue,
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.xxl,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.color,
    textAlign: 'center',
    marginBottom: 24,
  },
  description: {
    fontSize: tokens.typography.sizes.lg,
    color: tokens.colors.color2,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: tokens.colors.blue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: tokens.radius.button,
    alignItems: 'center',
  },
  buttonText: {
    color: tokens.colors.background,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
});
