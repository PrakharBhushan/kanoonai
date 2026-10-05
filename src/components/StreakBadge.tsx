import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Radius, Shadows } from '../theme/designSystem';

interface Props { streak: number }

export default function StreakBadge({ streak }: Props) {
  return (
    <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.badge}>
      <Text style={styles.text}>🔥 {streak}</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 6,
    ...Shadows.pressable,
  },
  text: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
