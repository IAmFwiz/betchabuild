import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Image } from 'react-native';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Animate logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => onFinish());
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* Using the transparent logo */}
        <Image 
          source={require('../assets/newbetcha-transparent.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.tagline}>Decide. Swipe. Done.</Text>
      </Animated.View>
      
      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <Text style={styles.loadingText}>Loading markets...</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 18,
    color: '#8E8E93',
    marginTop: 10,
    letterSpacing: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    width: '80%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 3,
    backgroundColor: '#1C1C1E',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#00D4FF',
    borderRadius: 2,
  },
  loadingText: {
    color: '#8E8E93',
    fontSize: 14,
  },
});
