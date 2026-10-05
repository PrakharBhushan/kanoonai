import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, TextStyle, StyleProp, Easing } from 'react-native';

interface Props {
  value: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  prefix?: string;
  suffix?: string;
  /** Custom formatter for the rounded number (e.g. toLocaleString). */
  format?: (n: number) => string;
}

/**
 * Counts up from 0 → value on mount, and animates between values on change.
 */
export default function AnimatedCounter({
  value, duration = 900, style, prefix = '', suffix = '', format,
}: Props) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const id = anim.addListener(({ value: v }) => setDisplay(v));
    Animated.timing(anim, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    return () => anim.removeListener(id);
  }, [value]);

  const rounded = Math.round(display);
  const text = format ? format(rounded) : String(rounded);

  return <Text style={style}>{prefix}{text}{suffix}</Text>;
}
