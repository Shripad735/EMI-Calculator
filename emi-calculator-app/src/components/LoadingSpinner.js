import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants/colors';

/**
 * Reusable LoadingSpinner component
 * @param {Object} props
 * @param {'small' | 'large'} props.size - Spinner size
 * @param {string} props.color - Spinner color
 * @param {string} props.message - Optional loading message
 * @param {boolean} props.fullScreen - Full screen overlay
 */
export default function LoadingSpinner({
  size = 'large',
  color = colors.primary,
  message,
  fullScreen = false,
}) {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={containerStyle}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text style={styles.message}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  message: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textLight,
    textAlign: 'center',
  },
});
