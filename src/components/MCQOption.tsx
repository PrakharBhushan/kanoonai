import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, View, Animated, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';
import { Radius, Shadows } from '../theme/designSystem';

type State = 'default' | 'selected' | 'correct' | 'wrong';

interface Props {
  letter: string;
  text: string;
  state: State;
  onPress: () => void;
  disabled: boolean;
}

export default function MCQOption({ letter, text, state, onPress, disabled }: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const shake = useRef(new Animated.Value(0)).current;
  const prevState = useRef<State>(state);

  // Feedback animations when transitioning into correct/wrong.
  useEffect(() => {
    if (prevState.current !== state) {
      if (state === 'correct') {
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.04, duration: 130, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
        ]).start();
      } else if (state === 'wrong') {
        Animated.sequence([
          Animated.timing(shake, { toValue: -9, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 9, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: -6, duration: 50, useNativeDriver: true }),
          Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
      }
    }
    prevState.current = state;
  }, [state]);

  const pressIn = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 0.98, friction: 7, useNativeDriver: true }).start();
  };
  const pressOut = () => {
    if (disabled) return;
    Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }).start();
  };
  const handle = () => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const bgColor = { default: '#f8fafc', selected: '#dbeafe', correct: '#dcfce7', wrong: '#fee2e2' }[state];
  const borderColor = { default: '#e2e8f0', selected: Colors.primary, correct: Colors.success, wrong: Colors.emergency }[state];
  const accent = { default: '#64748b', selected: Colors.primary, correct: Colors.success, wrong: Colors.emergency }[state];
  const icon = state === 'correct' ? '✓' : state === 'wrong' ? '✗' : letter;
  const filledCircle = state === 'correct' || state === 'wrong';
  const glow = state === 'correct' ? Shadows.glow(Colors.success)
    : state === 'wrong' ? Shadows.glow(Colors.emergency)
    : undefined;

  return (
    <Pressable onPress={handle} onPressIn={pressIn} onPressOut={pressOut} disabled={disabled}>
      <Animated.View
        style={[
          styles.btn,
          { backgroundColor: bgColor, borderColor },
          glow,
          { transform: [{ scale }, { translateX: shake }] },
        ]}
      >
        <View style={[styles.letterCircle, { borderColor: accent, backgroundColor: filledCircle ? accent : 'transparent' }]}>
          <Text style={[styles.letter, { color: filledCircle ? '#fff' : accent }]}>{icon}</Text>
        </View>
        <Text style={styles.text}>{text}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md,
    padding: 14, marginBottom: 10, borderWidth: 2,
  },
  letterCircle: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  letter: { fontWeight: '800', fontSize: 14 },
  text: { flex: 1, fontSize: 15, lineHeight: 22, color: '#1e293b' },
});
