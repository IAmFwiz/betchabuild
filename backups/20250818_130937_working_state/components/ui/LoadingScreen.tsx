import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/newbetcha-transparent.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <ActivityIndicator size="large" color="#4FC3F7" style={styles.spinner} />
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
  logo: {
    width: 200,
    height: 100,
    marginBottom: 40,
  },
  spinner: {
    marginTop: 20,
  },
});
