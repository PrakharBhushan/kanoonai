import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { Gradients, Radius, Shadows } from '../theme/designSystem';
import { useTheme } from '../theme/ThemeContext';
import { t } from '../i18n';
import AnimatedProgressBar from './AnimatedProgressBar';
import PressableScale from './PressableScale';

interface Props {
  title: string;
  icon: string;
  color: string;
  lessonsTotal: number;
  lessonsDone: number;
  locked: boolean;
  proOnly?: boolean;
  onPress: () => void;
}

export default function TopicCard({
  title, icon, color, lessonsTotal, lessonsDone, locked, proOnly, onPress,
}: Props) {
  const { colors, theme } = useTheme();
  const progress = lessonsTotal ? lessonsDone / lessonsTotal : 0;
  const done = lessonsTotal > 0 && lessonsDone === lessonsTotal;

  return (
    <PressableScale
      onPress={locked ? undefined : onPress}
      disabled={locked}
      haptic={!locked}
      style={[styles.outer, Shadows.card]}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <Text style={styles.icon}>{icon}</Text>
        </View>
        <View style={styles.middle}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.meta, { color: colors.subtext }]}>
            {lessonsDone}/{lessonsTotal} {t('learn.lessons')}
          </Text>
          <AnimatedProgressBar
            progress={progress}
            height={6}
            fillColors={[color, color] as [string, string]}
            trackColor={colors.border}
            shine={false}
          />
        </View>
        <View style={styles.right}>
          {done
            ? <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
            : <Ionicons name="chevron-forward" size={20} color={Colors.primary} />}
        </View>

        {locked && (
          <BlurView
            intensity={26}
            tint={theme === 'dark' ? 'dark' : 'light'}
            style={styles.lockOverlay}
          >
            <Ionicons name="lock-closed" size={20} color={colors.subtext} />
            {proOnly ? (
              <LinearGradient colors={Gradients.purple} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.proBadge}>
                <Text style={styles.proText}>PRO</Text>
              </LinearGradient>
            ) : (
              <Text style={[styles.lockText, { color: colors.subtext }]} numberOfLines={1}>
                {t('learn.locked')}
              </Text>
            )}
          </BlurView>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  outer: { borderRadius: Radius.lg, marginBottom: 10 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: Radius.lg, padding: 14, overflow: 'hidden',
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  icon: { fontSize: 24 },
  middle: { flex: 1 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  meta: { fontSize: 12, marginBottom: 8 },
  right: { marginLeft: 10, alignItems: 'center', justifyContent: 'center' },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  proBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  proText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  lockText: { fontSize: 12, fontWeight: '600' },
});
