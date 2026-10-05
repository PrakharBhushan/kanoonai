import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View, Easing } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = ['#1E4CB0', '#2563eb', '#fbbf24', '#f59e0b', '#22c55e', '#ef4444', '#8b5cf6'];

interface Piece {
  anim: Animated.Value;
  startX: number;
  drift: number;
  rotations: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  isCircle: boolean;
}

interface Props {
  count?: number;
  /** Called when the burst finishes (optional). */
  onDone?: () => void;
}

/**
 * Lightweight confetti burst — colored pieces fall, drift, rotate and fade.
 * Pure built-in Animated, no external library. Does not block touches.
 */
export default function Confetti({ count = 38, onDone }: Props) {
  const pieces = useRef<Piece[]>(
    Array.from({ length: count }).map(() => ({
      anim: new Animated.Value(0),
      startX: Math.random() * width,
      drift: (Math.random() - 0.5) * 180,
      rotations: 1 + Math.random() * 4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 7 + Math.random() * 9,
      delay: Math.random() * 350,
      duration: 1700 + Math.random() * 1300,
      isCircle: Math.random() > 0.5,
    }))
  ).current;

  useEffect(() => {
    const animations = pieces.map(p =>
      Animated.timing(p.anim, {
        toValue: 1,
        duration: p.duration,
        delay: p.delay,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    );
    Animated.parallel(animations).start(() => onDone?.());
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => {
        const translateY = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [-50, height + 60],
        });
        const translateX = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: [p.startX, p.startX + p.drift],
        });
        const rotate = p.anim.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', `${p.rotations * 360}deg`],
        });
        const opacity = p.anim.interpolate({
          inputRange: [0, 0.75, 1],
          outputRange: [1, 1, 0],
        });
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: p.isCircle ? p.size / 2 : 2,
              backgroundColor: p.color,
              opacity,
              transform: [{ translateX }, { translateY }, { rotate }],
            }}
          />
        );
      })}
    </View>
  );
}
