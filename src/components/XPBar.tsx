import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getLevelFromXP, getProgressPercent } from '../utils/xp';
import { Gradients } from '../theme/designSystem';
import AnimatedProgressBar from './AnimatedProgressBar';

interface Props {
  xp: number;
}

export default function XPBar({ xp }: Props) {
  const level = getLevelFromXP(xp);
  const progress = getProgressPercent(xp);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>⭐ {level.name}</Text>
        <Text style={styles.xpText}>{xp.toLocaleString()} XP</Text>
      </View>
      <AnimatedProgressBar
        progress={progress / 100}
        fillColors={Gradients.gold}
        height={9}
        trackColor="rgba(255,255,255,0.3)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '800', color: '#fff' },
  xpText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
});
