import React, { useRef } from 'react';
import { Animated, Pressable, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Motion } from '../theme/designSystem';

interface Props {
  onPress?: () => void;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  haptic?: boolean;
  disabled?: boolean;
}

/**
 * Wraps any content with a spring press-scale + light haptic.
 * The DRY primitive for tactile non-gradient surfaces (tiles, rows, options).
 */
export default function PressableScale({ onPress, children, style, haptic = true, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: Motion.pressScale, ...Motion.spring }).start();
  };
  const pressOut = () => Animated.spring(scale, { toValue: 1, ...Motion.spring }).start();
  const handle = () => {
    if (disabled) return;
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <Pressable onPress={handle} onPressIn={pressIn} onPressOut={pressOut} disabled={disabled}>
      <Animated.View style={[{ transform: [{ scale }] }, style]}>{children}</Animated.View>
    </Pressable>
  );
}
