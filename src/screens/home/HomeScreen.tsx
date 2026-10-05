import React, { useCallback, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
import { useTheme } from '../../theme/ThemeContext';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import { getLevelFromXP, getProgressPercent, getXPToNext } from '../../utils/xp';
import SOSButton from '../../components/SOSButton';
import GradientCard from '../../components/GradientCard';
import AnimatedProgressBar from '../../components/AnimatedProgressBar';
import AnimatedCounter from '../../components/AnimatedCounter';
import ScreenEnter from '../../components/ScreenEnter';
import { createSession } from '../../services/panicRecording';

const DAILY_TIPS = [
  'You have the right to remain silent during police questioning.',
  'A landlord cannot evict you without a court order.',
  'File RTI online at rtionline.gov.in — response within 30 days.',
  'Consumer court can be approached for free for claims under ₹50 lakh.',
  'POSH Act mandates every workplace with 10+ employees to have an ICC.',
  'Section 498A IPC protects against domestic cruelty.',
  'Minimum wage varies by state — check your state labor department.',
  'FIR must be registered by police — refusal is punishable under Section 166A IPC.',
  'Legal aid is free for women, SC/ST, disabled, and those earning below ₹3 lakh.',
  'You can challenge an illegal arrest under Article 32 or 226 of the Constitution.',
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return t('home.morning');
  if (h < 17) return t('home.afternoon');
  return t('home.evening');
}

// ---- staggered pop-in stat tile ----
function StatTile({
  gradient, icon, children, label, index,
}: {
  gradient: readonly [string, string, ...string[]];
  icon: string;
  children: React.ReactNode;
  label: string;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, delay: 120 + index * 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 6, tension: 120, delay: 120 + index * 90, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ flex: 1, opacity, transform: [{ scale }] }}>
      <GradientCard gradient={gradient} style={styles.statCard} contentStyle={styles.statContent}>
        <Text style={styles.statIcon}>{icon}</Text>
        {children}
        <Text style={styles.statLabel}>{label}</Text>
      </GradientCard>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const userData = useUser(user?.id);
  const { colors, toggleTheme, theme } = useTheme();

  const todayTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];
  const level = getLevelFromXP(userData.xp);
  const progress = getProgressPercent(userData.xp);
  const xpToNext = getXPToNext(userData.xp);

  const handleSOS = useCallback(() => {
    if (!user) return;
    const sessionId = createSession(user.id);
    navigation.navigate('PanicRecording', { sessionId, userId: user.id });
  }, [user]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle="light-content" />
      <ScreenEnter>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Gradient greeting header */}
          <LinearGradient
            colors={Gradients.brand}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.logoRow}>
              <Text style={styles.logoText}>⚖️ KanoonAI</Text>
              <TouchableOpacity onPress={toggleTheme} hitSlop={10}>
                <Ionicons name={theme === 'dark' ? 'sunny' : 'moon'} size={22} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.greeting}>
              {getGreeting()}{userData.name ? `, ${userData.name}` : ''}!
            </Text>
            <Text style={styles.subGreeting}>{t('home.dailyTip')}</Text>
          </LinearGradient>

          <View style={styles.body}>
            {/* Stat tiles */}
            <View style={styles.statsRow}>
              <StatTile gradient={Gradients.gold} icon="🔥" label={t('home.streak')} index={0}>
                <AnimatedCounter value={userData.streak} style={styles.statVal} />
              </StatTile>
              <StatTile gradient={Gradients.emergency} icon="❤️" label={t('home.hearts')} index={1}>
                <AnimatedCounter value={userData.hearts} style={styles.statVal} />
              </StatTile>
              <StatTile gradient={Gradients.purple} icon="⭐" label={t('home.level')} index={2}>
                <Text style={styles.statValText} numberOfLines={1}>{level.name.split(' ')[0]}</Text>
              </StatTile>
            </View>

            {/* XP card */}
            <View style={[styles.xpCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.xpRow}>
                <AnimatedCounter
                  value={userData.xp}
                  style={[styles.xpLabel, { color: colors.text }]}
                  suffix=" XP"
                  format={(n) => n.toLocaleString()}
                />
                <Text style={[styles.xpNext, { color: colors.subtext }]}>
                  +{xpToNext} {t('home.xpToNext')}
                </Text>
              </View>
              <AnimatedProgressBar progress={progress / 100} fillColors={Gradients.gold} height={10} />
            </View>

            {/* Emergency hero */}
            <GradientCard
              gradient={Gradients.emergency}
              glowColor={Colors.emergency}
              onPress={() => navigation.navigate('EmergencyTab')}
              style={styles.hero}
              contentStyle={styles.heroContent}
            >
              <View style={styles.iconBadge}>
                <Ionicons name="alert-circle" size={28} color="#fff" />
              </View>
              <View style={styles.heroTextArea}>
                <Text style={styles.heroTitle}>{t('home.emergency')}</Text>
                <Text style={styles.heroDesc}>{t('home.emergencyDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.85)" />
            </GradientCard>

            {/* Learn hero */}
            <GradientCard
              gradient={Gradients.brand}
              glowColor={Colors.primary}
              onPress={() => navigation.navigate('LearnTab')}
              style={styles.hero}
              contentStyle={styles.heroContent}
            >
              <View style={styles.iconBadge}>
                <Ionicons name="book" size={26} color="#fff" />
              </View>
              <View style={styles.heroTextArea}>
                <Text style={styles.heroTitle}>{t('home.learn')}</Text>
                <Text style={styles.heroDesc}>{t('home.learnDesc')}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.85)" />
            </GradientCard>

            {/* Daily tip */}
            <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.tipAccent} />
              <View style={styles.tipBody}>
                <Text style={[styles.tipHeader, { color: Colors.primary }]}>
                  💡 {t('home.dailyTip')}
                </Text>
                <Text style={[styles.tipText, { color: colors.text }]}>{todayTip}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </ScreenEnter>

      <SOSButton onStartRecording={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingBottom: 110 },
  header: {
    paddingTop: 60, paddingBottom: 28, paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoText: { fontSize: 22, fontWeight: '900', color: '#fff' },
  greeting: { fontSize: 26, fontWeight: '900', color: '#fff', marginTop: 18, letterSpacing: -0.3 },
  subGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  body: { paddingHorizontal: Spacing.lg, marginTop: -14 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.lg },
  statCard: { flex: 1 },
  statContent: { alignItems: 'center', paddingVertical: Spacing.lg, paddingHorizontal: Spacing.sm },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statVal: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statValText: { fontSize: 17, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 11, marginTop: 4, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  xpCard: {
    borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg,
    borderWidth: 1, ...Shadows.card,
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  xpLabel: { fontWeight: '800', fontSize: 16 },
  xpNext: { fontSize: 12, fontWeight: '600' },
  hero: { marginBottom: Spacing.md },
  heroContent: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xl },
  iconBadge: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center',
  },
  heroTextArea: { flex: 1, paddingHorizontal: 14 },
  heroTitle: { color: '#fff', fontWeight: '900', fontSize: 19 },
  heroDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 3 },
  tipCard: {
    flexDirection: 'row', borderRadius: Radius.lg, marginTop: 4, marginBottom: 10,
    borderWidth: 1, overflow: 'hidden', ...Shadows.card,
  },
  tipAccent: { width: 5, backgroundColor: Colors.primary },
  tipBody: { flex: 1, padding: Spacing.lg },
  tipHeader: { fontWeight: '800', fontSize: 14, marginBottom: 6 },
  tipText: { fontSize: 14, lineHeight: 22 },
});
