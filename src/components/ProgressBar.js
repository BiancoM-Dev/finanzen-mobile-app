import React from 'react';
import { View, StyleSheet } from 'react-native';

export const ProgressBar = ({ progress = 0, color = '#10B981', height = 10, backgroundColor = '#E5E7EB' }) => {
  // Asegurar que el porcentaje esté entre 0 y 100
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, backgroundColor }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clamped}%`,
            backgroundColor: color,
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
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 8,
  },
});
