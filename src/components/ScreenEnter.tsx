import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp, Easing } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Stagger this entrance (ms) — useful for sequencing sibling sections. */
  delay?: number;
  /** Initial downward offset in px (default 12). */
  offset?: number;
}

/**
 * Fades + slides children up on mount for a consistent, intentional entrance.
 */
export default function ScreenEnter({ children, style, delay = 0, offset = 12 }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 280, delay, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: 0, duration: 300, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[{ flex: 1, opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
