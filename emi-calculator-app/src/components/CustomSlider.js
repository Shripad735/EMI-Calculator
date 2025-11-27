import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { colors } from '../constants/colors';

/**
 * CustomSlider - A wrapper around @react-native-community/slider
 * Provides consistent styling and behavior across platforms
 * 
 * Features:
 * - Reliable touch recognition on all platforms
 * - Tap-to-position functionality
 * - Smooth dragging experience
 * - Consistent styling
 */
const CustomSlider = ({
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  value = 0,
  onValueChange,
  minimumTrackTintColor = colors.primary,
  maximumTrackTintColor = colors.border,
  thumbTintColor = colors.primary,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Slider
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        value={value}
        onValueChange={onValueChange}
        onSlidingComplete={onValueChange}
        minimumTrackTintColor={minimumTrackTintColor}
        maximumTrackTintColor={maximumTrackTintColor}
        thumbTintColor={thumbTintColor}
        style={styles.slider}
        tapToSeek={true}
        // Platform-specific optimizations
        {...Platform.select({
          ios: {
            // iOS uses native slider
          },
          android: {
            // Android-specific props for better touch handling
            thumbStyle: styles.androidThumb,
          },
          web: {
            // Web-specific props
          },
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  androidThumb: {
    width: 28,
    height: 28,
  },
});

export default CustomSlider;
