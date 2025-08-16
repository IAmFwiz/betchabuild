import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const LoadingScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Image
          source={require('../assets/newbetcha-transparent.png')}
          style={styles.logo}
          contentFit="contain"
        />
        
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslate }],
            },
          ]}
        >
          <LinearGradient
            colors={['transparent', 'rgba(79, 195, 247, 0.3)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </Animated.View>

      <View style={styles.loadingBar}>
        <Animated.View
          style={[
            styles.loadingProgress,
            {
              width: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0B0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 250,
    height: 150,
    position: 'relative',
    overflow: 'hidden',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  shimmerGradient: {
    flex: 1,
  },
  loadingBar: {
    width: 200,
    height: 3,
    backgroundColor: tokens.colors.surface2,
    borderRadius: 1.5,
    marginTop: 50,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: tokens.colors.blue,
    borderRadius: 1.5,
  },
});
