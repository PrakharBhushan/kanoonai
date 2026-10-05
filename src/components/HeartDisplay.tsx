import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

interface Props {
  hearts: number;
  max?: number;
}

export default function HeartDisplay({ hearts, max = 3 }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: max }).map((_, i) => (
        <HeartIcon key={i} filled={i < hearts} />
      ))}
    </View>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const prevFilled = useRef(filled);

  // Scale-bounce when a heart is lost (filled -> empty).
  useEffect(() => {
    if (prevFilled.current && !filled) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.4, duration: 140, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
      ]).start();
    }
    prevFilled.current = filled;
  }, [filled]);

  // Subtle continuous pulse on remaining (filled) hearts.
  useEffect(() => {
    if (!filled) { pulse.setValue(1); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [filled]);

  return (
    <Animated.Text style={[styles.heart, { transform: [{ scale: Animated.multiply(scale, pulse) }] }]}>
      {filled ? '❤️' : '🤍'}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 4 },
  heart: { fontSize: 22 },
});
