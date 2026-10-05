import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
import { useTheme } from '../../theme/ThemeContext';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import { getLevelFromXP, getProgressPercent } from '../../utils/xp';
import SOSButton from '../../components/SOSButton';
import GradientCard from '../../components/GradientCard';
import AnimatedCounter from '../../components/AnimatedCounter';
import AnimatedProgressBar from '../../components/AnimatedProgressBar';
import PressableScale from '../../components/PressableScale';
import EnterView from '../../components/EnterView';
import { createSession } from '../../services/panicRecording';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const userData = useUser(user?.id);
  const { colors } = useTheme();
  const level = getLevelFromXP(userData.xp);
  const progress = getProgressPercent(userData.xp);

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    navigation.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  const handleSignOut = () => {
    Alert.alert(t('profile.signOut'), 'Are you sure?', [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.yes'), onPress: () => supabase.auth.signOut() },
    ]);
  };

  const displayName = userData.name || user?.email || '';
  const initial = displayName ? displayName.trim()[0].toUpperCase() : 'K';

  const stats = [
    { key: 'xp', icon: '⭐', gradient: Gradients.gold, num: userData.xp, label: t('profile.xp'), fmt: (n: number) => n.toLocaleString() },
    { key: 'streak', icon: '🔥', gradient: Gradients.emergency, num: userData.streak, label: t('profile.streak') },
    { key: 'level', icon: '🏅', gradient: Gradients.purple, text: level.name.split(' ')[0], label: t('profile.level') },
    { key: 'lessons', icon: '📚', gradient: Gradients.brand, num: 0, label: t('profile.lessonsCompleted') },
  ] as const;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </View>
        <Text style={styles.name}>{userData.name || user?.email}</Text>
        <View style={styles.planBadge}>
          <Text style={styles.planText}>{t(`profile.${userData.plan === 'free' ? 'free' : 'proMonthly'}`)}</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stat grid */}
        <View style={styles.statsGrid}>
          {stats.map((s, i) => (
            <EnterView key={s.key} delay={i * 80} scaleFrom={0.92} style={styles.statCell}>
              <GradientCard gradient={s.gradient} contentStyle={styles.statContent}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                {'text' in s
                  ? <Text style={styles.statValText} numberOfLines={1}>{s.text}</Text>
                  : <AnimatedCounter value={s.num} style={styles.statVal} format={'fmt' in s ? s.fmt : undefined} />}
                <Text style={styles.statLabel}>{s.label}</Text>
              </GradientCard>
            </EnterView>
          ))}
        </View>

        {/* XP progress */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>⭐ {level.name}</Text>
          <AnimatedProgressBar progress={progress / 100} fillColors={Gradients.gold} height={10} />
          <Text style={[styles.xpMeta, { color: colors.subtext }]}>{userData.xp.toLocaleString()} XP</Text>
        </View>

        {/* Menu */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <PressableScale onPress={() => navigation.navigate('Settings' as any)} style={styles.menuItem} haptic={false}>
            <View style={[styles.menuChip, { backgroundColor: Colors.primary + '22' }]}>
              <Ionicons name="settings-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>{t('profile.settings')}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </PressableScale>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <PressableScale onPress={() => navigation.navigate('PINSetup' as any)} style={styles.menuItem} haptic={false}>
            <View style={[styles.menuChip, { backgroundColor: Colors.primary + '22' }]}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            </View>
            <Text style={[styles.menuText, { color: colors.text }]}>{t('profile.changePIN')}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
          </PressableScale>
        </View>

        {userData.plan === 'free' && (
          <GradientCard gradient={Gradients.purple} glowColor={Colors.purple} onPress={() => {}} contentStyle={styles.upgradeContent} style={styles.upgrade}>
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.upgradeText}>{t('profile.upgrade')}</Text>
          </GradientCard>
        )}

        <PressableScale onPress={handleSignOut} style={[styles.signOutBtn, { backgroundColor: '#fee2e2' }]} haptic={false}>
          <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
        </PressableScale>
      </ScrollView>

      <SOSButton onStartRecording={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 64, paddingBottom: 28, alignItems: 'center',
    borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
  },
  avatarRing: {
    width: 84, height: 84, borderRadius: 42,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatar: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 30, fontWeight: '900' },
  name: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  planBadge: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 4 },
  planText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  content: { padding: Spacing.lg, paddingBottom: 110 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 4 },
  statCell: { width: '47.5%' },
  statContent: { alignItems: 'center', paddingVertical: Spacing.lg },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statVal: { fontSize: 22, fontWeight: '900', color: '#fff' },
  statValText: { fontSize: 18, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 11, marginTop: 4, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  section: { borderRadius: Radius.lg, padding: Spacing.lg, marginTop: 12, borderWidth: 1, ...Shadows.card },
  sectionTitle: { fontWeight: '800', fontSize: 16, marginBottom: 12 },
  xpMeta: { fontSize: 12, marginTop: 8, fontWeight: '600' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  menuChip: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600' },
  divider: { height: 1, marginVertical: 2 },
  upgrade: { marginTop: 12 },
  upgradeContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16 },
  upgradeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  signOutBtn: { borderRadius: Radius.md, padding: 16, alignItems: 'center', marginTop: 12 },
  signOutText: { color: Colors.emergency, fontWeight: '700', fontSize: 16 },
});
