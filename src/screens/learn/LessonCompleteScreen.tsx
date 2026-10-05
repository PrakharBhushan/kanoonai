import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LearnStackParamList } from '../../navigation/types';
import { t } from '../../i18n';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import SOSButton from '../../components/SOSButton';
import Confetti from '../../components/Confetti';
import AnimatedCounter from '../../components/AnimatedCounter';
import AnimatedButton from '../../components/AnimatedButton';
import { createSession } from '../../services/panicRecording';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<LearnStackParamList, 'LessonComplete'>;

export default function LessonCompleteScreen({ route, navigation }: Props) {
  const { xpEarned, lessonTitle, topicId } = route.params;
  const { user } = useAuth();
  const userData = useUser(user?.id);
  const nav = useNavigation<any>();

  const badgeScale = useRef(new Animated.Value(0)).current;
  const flame = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(badgeScale, { toValue: 1, friction: 4, tension: 80, delay: 150, useNativeDriver: true }).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(flame, { toValue: 1.18, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(flame, { toValue: 1, duration: 600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    nav.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  return (
    <LinearGradient colors={Gradients.slate} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.root}>
      <Confetti count={40} />

      <View style={styles.content}>
        <Animated.View style={[styles.checkBadge, { transform: [{ scale: badgeScale }] }]}>
          <LinearGradient colors={Gradients.success} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </LinearGradient>
        </Animated.View>

        <Text style={styles.title}>{t('learn.lessonComplete')}</Text>
        <Text style={styles.lessonName}>{lessonTitle}</Text>

        <LinearGradient colors={Gradients.gold} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.xpCard}>
          <Text style={styles.xpLabel}>{t('learn.xpEarned')}</Text>
          <AnimatedCounter value={xpEarned} prefix="+" style={styles.xpValue} duration={1100} />
        </LinearGradient>

        <View style={styles.streakRow}>
          <Animated.Text style={[styles.streakFlame, { transform: [{ scale: flame }] }]}>🔥</Animated.Text>
          <Text style={styles.streakText}>{userData.streak} {t('home.streak')}</Text>
        </View>

        <View style={styles.btnRow}>
          <View style={styles.btnFlex}>
            <AnimatedButton
              label={t('learn.backToTopics')}
              onPress={() => navigation.navigate('LearnHome')}
              variant="secondary"
            />
          </View>
          <View style={styles.btnFlex}>
            <AnimatedButton
              label={t('learn.nextLesson')}
              onPress={() => navigation.navigate('Topic', { topicId, topicTitle: '' })}
              variant="primary"
              icon="arrow-forward"
            />
          </View>
        </View>
      </View>

      <SOSButton onStartRecording={handleSOS} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl },
  checkBadge: { marginBottom: 24 },
  checkCircle: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center', ...Shadows.glow('#22c55e'),
  },
  checkMark: { color: '#fff', fontSize: 64, fontWeight: '900', marginTop: -4 },
  title: { fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 8 },
  lessonName: { fontSize: 16, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 28 },
  xpCard: {
    borderRadius: Radius.lg, paddingVertical: 22, paddingHorizontal: 40,
    alignItems: 'center', marginBottom: 20, minWidth: 200, ...Shadows.glow('#f59e0b'),
  },
  xpLabel: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '700', marginBottom: 4 },
  xpValue: { color: '#fff', fontSize: 48, fontWeight: '900' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 40 },
  streakFlame: { fontSize: 24 },
  streakText: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: 12, alignSelf: 'stretch' },
  btnFlex: { flex: 1 },
});
