import React, { useState, useRef } from 'react';
import { View, StyleSheet, PanResponder, Animated, Text } from 'react-native';
import { colors } from '../constants/colors';

/**
 * CustomSlider - A custom slider component that works reliably on all platforms
 * This replaces @react-native-community/slider which has issues with new architecture
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
  const [sliderWidth, setSliderWidth] = useState(0);
  const thumbSize = 24;
  const trackHeight = 4;

  // Calculate position from value
  const getPositionFromValue = (val) => {
    if (sliderWidth === 0) return 0;
    const range = maximumValue - minimumValue;
    const percentage = (val - minimumValue) / range;
    return percentage * (sliderWidth - thumbSize);
  };

  // Calculate value from position
  const getValueFromPosition = (position) => {
    const range = maximumValue - minimumValue;
    const percentage = position / (sliderWidth - thumbSize);
    let newValue = minimumValue + percentage * range;
    
    // Apply step
    if (step > 0) {
      newValue = Math.round(newValue / step) * step;
    }
    
    // Clamp value
    return Math.max(minimumValue, Math.min(maximumValue, newValue));
  };

  const position = useRef(new Animated.Value(getPositionFromValue(value))).current;

  // Update position when value changes externally
  React.useEffect(() => {
    if (sliderWidth > 0) {
      position.setValue(getPositionFromValue(value));
    }
  }, [value, sliderWidth]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        // Handle tap on track
        const touchX = evt.nativeEvent.locationX - thumbSize / 2;
        const clampedX = Math.max(0, Math.min(touchX, sliderWidth - thumbSize));
        position.setValue(clampedX);
        const newValue = getValueFromPosition(clampedX);
        if (onValueChange) {
          onValueChange(newValue);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const currentPosition = getPositionFromValue(value);
        let newPosition = currentPosition + gestureState.dx;
        newPosition = Math.max(0, Math.min(newPosition, sliderWidth - thumbSize));
        position.setValue(newPosition);
        const newValue = getValueFromPosition(newPosition);
        if (onValueChange) {
          onValueChange(newValue);
        }
      },
      onPanResponderRelease: () => {
        // Final value is already set in onPanResponderMove
      },
    })
  ).current;

  const handleLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    setSliderWidth(width);
  };

  const thumbPosition = getPositionFromValue(value);
  const filledWidth = thumbPosition + thumbSize / 2;

  return (
    <View 
      style={[styles.container, style]} 
      onLayout={handleLayout}
      {...panResponder.panHandlers}
    >
      {/* Track background */}
      <View style={[styles.track, { backgroundColor: maximumTrackTintColor, height: trackHeight }]}>
        {/* Filled track */}
        <View 
          style={[
            styles.filledTrack, 
            { 
              backgroundColor: minimumTrackTintColor, 
              width: sliderWidth > 0 ? filledWidth : 0,
              height: trackHeight,
            }
          ]} 
        />
      </View>
      
      {/* Thumb */}
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbTintColor,
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            left: sliderWidth > 0 ? thumbPosition : 0,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    width: '100%',
    borderRadius: 2,
    position: 'relative',
  },
  filledTrack: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default CustomSlider;
