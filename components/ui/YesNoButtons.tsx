import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppPrediction } from '../../lib/kalshi/transformer';
import { tokens } from '../../theme/tokens';

interface YesNoButtonsProps {
  prediction: AppPrediction;
  onYes: () => void;
  onNo: () => void;
}

export const YesNoButtons = ({ prediction, onYes, onNo }: YesNoButtonsProps) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.button, styles.noButton]} 
        onPress={onNo}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[tokens.colors.red, tokens.colors.redStrong]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.buttonText}>NO</Text>
          <Text style={styles.percentageText}>{prediction.currentOdds.no}¢</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.yesButton]} 
        onPress={onYes}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[tokens.colors.blue, tokens.colors.blueStrong]}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.buttonText}>YES</Text>
          <Text style={styles.percentageText}>{prediction.currentOdds.yes}¢</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...tokens.shadows.elevation,
  },
  noButton: {
    // Additional styling for NO button if needed
  },
  yesButton: {
    // Additional styling for YES button if needed
  },
  gradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: tokens.colors.background,
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.heavy,
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  percentageText: {
    color: tokens.colors.background,
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.bold,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
