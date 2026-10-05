import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp, Easing } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Stagger delay in ms — increase per sibling for sequential reveals. */
  delay?: number;
  /** Initial downward offset (px). */
  offset?: number;
  /** If set, also springs scale from this value to 1 (e.g. 0.92 for a pop). */
  scaleFrom?: number;
}

/**
 * Per-item entrance: fade + slide-up (+ optional scale pop) with a delay.
 * Unlike ScreenEnter it does not force flex:1, so it's safe for tiles/rows/sections.
 */
export default function EnterView({ children, style, delay = 0, offset = 14, scaleFrom }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(offset)).current;
  const scale = useRef(new Animated.Value(scaleFrom ?? 1)).current;

  useEffect(() => {
    const animations = [
      Animated.timing(opacity, { toValue: 1, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(translateY, {
        toValue: 0, duration: 340, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
    ];
    if (scaleFrom !== undefined) {
      animations.push(
        Animated.spring(scale, { toValue: 1, friction: 6, tension: 120, delay, useNativeDriver: true })
      );
    }
    Animated.parallel(animations).start();
  }, []);

  const transform: any[] = [{ translateY }];
  if (scaleFrom !== undefined) transform.push({ scale });

  return <Animated.View style={[style, { opacity, transform }]}>{children}</Animated.View>;
}
