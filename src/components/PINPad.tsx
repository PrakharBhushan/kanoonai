import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';

interface Props {
  onComplete: (pin: string) => void;
  label: string;
  error: string | null;
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

// ---- a single dot that pops when it becomes filled ----
function Dot({ filled }: { filled: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(filled);
  useEffect(() => {
    if (filled && !prev.current) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.4, friction: 4, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]).start();
    }
    prev.current = filled;
  }, [filled]);
  return <Animated.View style={[styles.dot, filled && styles.dotFilled, { transform: [{ scale }] }]} />;
}

// ---- a key with press-scale ----
function Key({ value, onPress }: { value: string; onPress: (v: string) => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  if (value === '') return <View style={[styles.keyBtn, styles.invisible]} />;
  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.88, friction: 6, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start()}
      onPress={() => onPress(value)}
    >
      <Animated.View style={[styles.keyBtn, { transform: [{ scale }] }]}>
        <Text style={styles.keyText}>{value}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function PINPad({ onComplete, label, error }: Props) {
  const [pin, setPin] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    if (error) triggerShake();
  }, [error]);

  const handleKey = async (key: string) => {
    if (key === '') return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === '⌫') {
      setPin(p => p.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) {
      setTimeout(() => {
        onComplete(next);
        setPin('');
      }, 120);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.dots, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map(i => (
          <Dot key={i} filled={pin.length > i} />
        ))}
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.grid}>
        {KEYS.map((key, idx) => (
          <Key key={idx} value={key} onPress={handleKey} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingHorizontal: 24 },
  label: { fontSize: 16, color: '#fff', textAlign: 'center', marginBottom: 20 },
  dots: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  dot: {
    width: 16, height: 16, borderRadius: 8,
    borderWidth: 2, borderColor: '#fff', backgroundColor: 'transparent',
  },
  dotFilled: { backgroundColor: '#fff' },
  error: { color: '#fecaca', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap', width: 240,
    justifyContent: 'center', marginTop: 12,
  },
  keyBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    margin: 6,
  },
  invisible: { backgroundColor: 'transparent' },
  keyText: { color: '#fff', fontSize: 24, fontWeight: '600' },
});
