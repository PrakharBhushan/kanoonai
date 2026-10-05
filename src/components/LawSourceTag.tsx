import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gradients, Radius, Shadows } from '../theme/designSystem';

interface Props {
  sources: string[];
}

export default function LawSourceTag({ sources }: Props) {
  if (!sources.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {sources.map((src, i) => (
          <LinearGradient
            key={i}
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.tag}
          >
            <Text style={styles.tagText}>{src}</Text>
          </LinearGradient>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { marginVertical: 8 },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  tag: {
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    ...Shadows.pressable,
  },
  tagText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
