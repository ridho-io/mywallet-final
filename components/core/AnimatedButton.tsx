// components/core/AnimatedButton.tsx
import React, { ReactNode, useEffect } from 'react';
import { Pressable, PressableProps } from 'react-native';
import { MotiView, useAnimationState } from 'moti'; // 1. Import useAnimationState

type AnimatedButtonProps = {
  onPress?: PressableProps['onPress'];
  children: ReactNode;
};

const AnimatedButton = ({ onPress, children }: AnimatedButtonProps) => {
  // 2. Inisialisasi state animasi
  const animationState = useAnimationState({
    from: {
      scale: 1,
    },
    to: {
      scale: 1,
    },
    // 3. Definisikan state kustom 'pressed'
    pressed: {
      scale: 0.95,
    },
  });

  const handlePressIn = () => {
    // 4. Transisi ke state 'pressed'
    animationState.transitionTo('pressed');
  };

  const handlePressOut = () => {
    // 5. Transisi kembali ke state 'to' (default)
    animationState.transitionTo('to');
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <MotiView
        state={animationState} // 6. Hubungkan MotiView dengan state animasi
        transition={{ type: 'timing', duration: 150 }}
      >
        {children}
      </MotiView>
    </Pressable>
  );
};

export default AnimatedButton;