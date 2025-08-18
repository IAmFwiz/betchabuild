import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../../theme/tokens';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[tokens.colors.background, tokens.colors.surface]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Create Account</Text>
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
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
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
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: tokens.radius.button,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.blue,
  },
  secondaryButtonText: {
    color: tokens.colors.blue,
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.bold,
  },
});
