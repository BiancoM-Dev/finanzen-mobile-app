import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const ProgressBar = ({ progress = 0, color, height = 8, backgroundColor }) => {
  const { colors } = useTheme();
  const clamped = Math.min(100, Math.max(0, progress));
  const fillColor = color || colors.primary;
  const trackColor = backgroundColor || colors.surfaceSubtle;

  return (
    <View style={[styles.track, { height, backgroundColor: trackColor }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: fillColor,
            height,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 10,
  },
});
