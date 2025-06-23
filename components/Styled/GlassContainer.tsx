// components/Styled/GlassContainer.tsx
import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';

interface GlassContainerProps extends ViewProps {
  children: React.ReactNode;
}

const GlassContainer = ({ children, style }: GlassContainerProps) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
    >
      <BlurView intensity={50} tint="light" style={[styles.container, style]}>
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 0.1)']}
          style={StyleSheet.absoluteFill}
          pointerEvents='none'
        />
        {children}
      </BlurView>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden', // Penting agar BlurView dan Gradient mengikuti border radius
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 16,
  },
});

export default GlassContainer;