import React, { useRef } from 'react';
import {
  Animated, Pressable, StyleSheet, ViewStyle, StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Radius, Shadows, Spacing, Motion } from '../theme/designSystem';

type GradientTuple = readonly [string, string, ...string[]];

interface Props {
  gradient: GradientTuple;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
  haptic?: boolean;
  radius?: number;
  glowColor?: string;
}

/**
 * Rounded gradient card with a soft/glow shadow.
 * When `onPress` is supplied it becomes tactile: spring press-scale + light haptic.
 */
export default function GradientCard({
  gradient, onPress, style, contentStyle, children,
  haptic = true, radius = Radius.lg, glowColor,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, { toValue: Motion.pressScale, ...Motion.spring }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, ...Motion.spring }).start();
  const handlePress = () => {
    if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const shadow = glowColor ? Shadows.glow(glowColor) : Shadows.card;

  const inner = (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradient, { borderRadius: radius }, contentStyle]}
    >
      {children}
    </LinearGradient>
  );

  if (!onPress) {
    return (
      <Animated.View style={[{ borderRadius: radius }, shadow, style]}>
        {inner}
      </Animated.View>
    );
  }

  return (
    <Pressable onPress={handlePress} onPressIn={pressIn} onPressOut={pressOut}>
      <Animated.View
        style={[{ borderRadius: radius, transform: [{ scale }] }, shadow, style]}
      >
        {inner}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gradient: { padding: Spacing.lg, overflow: 'hidden' },
});
