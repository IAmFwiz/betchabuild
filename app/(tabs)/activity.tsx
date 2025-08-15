import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { tokens } from '../../theme/tokens';

export default function ActivityScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity</Text>
        <Text style={styles.subtitle}>Your prediction history</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Activity history coming soon!</Text>
          <Text style={styles.placeholderSubtext}>This will show your betting history, wins, losses, and performance stats</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: tokens.typography.sizes.huge,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.color,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: tokens.typography.sizes.md,
    color: tokens.colors.color2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderText: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.semibold,
    color: tokens.colors.color,
    textAlign: 'center',
    marginBottom: 16,
  },
  placeholderSubtext: {
    fontSize: tokens.typography.sizes.md,
    color: tokens.colors.color2,
    textAlign: 'center',
    lineHeight: 24,
  },
});
