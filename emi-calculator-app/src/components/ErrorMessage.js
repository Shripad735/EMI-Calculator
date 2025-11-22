import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../constants/colors';
import Button from './Button';

/**
 * Reusable ErrorMessage component
 * @param {Object} props
 * @param {string} props.message - Error message to display
 * @param {string} props.title - Optional error title
 * @param {Function} props.onRetry - Optional retry handler
 * @param {string} props.retryText - Text for retry button
 * @param {'error' | 'warning' | 'info'} props.type - Message type
 * @param {boolean} props.fullScreen - Full screen centered display
 * @param {Object} props.style - Additional styles
 */
export default function ErrorMessage({
  message,
  title,
  onRetry,
  retryText = 'Try Again',
  type = 'error',
  fullScreen = false,
  style,
}) {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;
  
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'error':
      default:
        return '❌';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'warning':
        return {
          background: colors.warningLight,
          border: colors.warning,
          text: colors.warningDark,
        };
      case 'info':
        return {
          background: colors.infoLight,
          border: colors.info,
          text: colors.infoDark,
        };
      case 'error':
      default:
        return {
          background: colors.errorLight,
          border: colors.error,
          text: colors.error,
        };
    }
  };

  const typeColors = getColors();

  return (
    <View style={[containerStyle, style]}>
      <View
        style={[
          styles.messageBox,
          {
            backgroundColor: typeColors.background,
            borderColor: typeColors.border,
          },
        ]}
      >
        <Text style={styles.icon}>{getIcon()}</Text>
        
        {title && (
          <Text style={[styles.title, { color: typeColors.text }]}>
            {title}
          </Text>
        )}
        
        <Text style={[styles.message, { color: typeColors.text }]}>
          {message}
        </Text>
        
        {onRetry && (
          <Button
            title={retryText}
            onPress={onRetry}
            variant={type === 'error' ? 'danger' : 'primary'}
            size="medium"
            style={styles.retryButton}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.base,
  },
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  messageBox: {
    borderRadius: borderRadius.base,
    borderWidth: 1,
    padding: spacing.lg,
    alignItems: 'center',
    maxWidth: 400,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.base,
    lineHeight: typography.fontSize.base * 1.5,
  },
  retryButton: {
    marginTop: spacing.md,
    minWidth: 120,
  },
});
