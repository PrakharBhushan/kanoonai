import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle, StyleProp, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Radius } from '../theme/designSystem';

type GradientTuple = readonly [string, string, ...string[]];

interface Props {
  /** 0..1 */
  progress: number;
  height?: number;
  trackColor?: string;
  fillColors?: GradientTuple;
  style?: StyleProp<ViewStyle>;
  /** Subtle moving shine across the fill. */
  shine?: boolean;
}

export default function AnimatedProgressBar({
  progress, height = 10, trackColor = 'rgba(148,163,184,0.25)',
  fillColors = Gradients.gold, style, shine = true,
}: Props) {
  const fill = useRef(new Animated.Value(0)).current;
  const shineX = useRef(new Animated.Value(0)).current;

  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(fill, {
      toValue: clamped,
      duration: 700,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // width interpolation
    }).start();
  }, [clamped]);

  useEffect(() => {
    if (!shine) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shineX, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.delay(900),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shine]);

  const widthInterpolate = fill.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const shineTranslate = shineX.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 220],
  });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2, backgroundColor: trackColor }, style]}>
      <Animated.View style={[styles.fillWrap, { width: widthInterpolate, borderRadius: height / 2 }]}>
        <LinearGradient
          colors={fillColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        {shine && (
          <Animated.View
            style={[styles.shine, { transform: [{ translateX: shineTranslate }, { rotate: '18deg' }] }]}
          />
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { width: '100%', overflow: 'hidden' },
  fillWrap: { height: '100%', overflow: 'hidden' },
  shine: {
    position: 'absolute', top: -10, bottom: -10, width: 30,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
