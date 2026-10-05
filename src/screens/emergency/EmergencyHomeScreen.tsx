import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmergencyStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import SOSButton from '../../components/SOSButton';
import GradientCard from '../../components/GradientCard';
import PressableScale from '../../components/PressableScale';
import EnterView from '../../components/EnterView';
import { createSession } from '../../services/panicRecording';

type Props = NativeStackScreenProps<EmergencyStackParamList, 'EmergencyHome'>;

const PRELOADED = [
  { key: 'police', icon: '🚨', color: Colors.emergency },
  { key: 'tenant', icon: '🏠', color: Colors.primary },
  { key: 'consumer', icon: '🛒', color: Colors.success },
  { key: 'workplace', icon: '💼', color: Colors.warning },
  { key: 'rti', icon: '📋', color: Colors.purple },
  { key: 'fraud', icon: '💻', color: Colors.emergency },
  { key: 'domestic', icon: '🏡', color: Colors.warning },
  { key: 'labour', icon: '⚒️', color: Colors.primary },
] as const;

export default function EmergencyHomeScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const nav = useNavigation<any>();

  const handleSOS = useCallback(() => {
    if (!user) return;
    const sessionId = createSession(user.id);
    nav.navigate('PanicRecording', { sessionId, userId: user.id });
  }, [user]);

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={Gradients.emergency} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <Text style={styles.title}>{t('emergency.title')}</Text>
        <Text style={styles.subtitle}>{t('emergency.chooseInput')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input options */}
        <View style={styles.optionRow}>
          <EnterView delay={60} scaleFrom={0.92} style={styles.optionFlex}>
            <GradientCard
              gradient={Gradients.brand}
              glowColor={Colors.primary}
              onPress={() => navigation.navigate('EmergencyInput', { mode: 'describe' })}
              contentStyle={styles.optionContent}
            >
              <Text style={styles.optionIcon}>🎙️</Text>
              <Text style={styles.optionTitle}>{t('emergency.describe')}</Text>
            </GradientCard>
          </EnterView>
          <EnterView delay={140} scaleFrom={0.92} style={styles.optionFlex}>
            <GradientCard
              gradient={Gradients.purple}
              glowColor={Colors.purple}
              onPress={() => navigation.navigate('EmergencyInput', { mode: 'photo' })}
              contentStyle={styles.optionContent}
            >
              <Text style={styles.optionIcon}>📷</Text>
              <Text style={styles.optionTitle}>{t('emergency.photo')}</Text>
            </GradientCard>
          </EnterView>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t('emergency.preloaded')}</Text>

        <View style={styles.grid}>
          {PRELOADED.map((item, i) => (
            <EnterView key={item.key} delay={200 + i * 70} scaleFrom={0.92} style={styles.gridItem}>
              <PressableScale
                onPress={() => navigation.navigate('EmergencyInput', { mode: 'preloaded', category: item.key })}
                style={[styles.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.iconCircle, { backgroundColor: item.color + '22' }]}>
                  <Text style={styles.gridIcon}>{item.icon}</Text>
                </View>
                <Text style={[styles.gridText, { color: colors.text }]}>
                  {t(`emergency.preloadedIssues.${item.key}`)}
                </Text>
              </PressableScale>
            </EnterView>
          ))}
        </View>
      </ScrollView>

      <SOSButton onStartRecording={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 56, paddingBottom: 26, paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
  },
  title: { color: '#fff', fontSize: 26, fontWeight: '900', marginBottom: 6 },
  subtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14 },
  content: { padding: Spacing.lg, paddingBottom: 110 },
  optionRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.xl },
  optionFlex: { flex: 1 },
  optionContent: { alignItems: 'center', paddingVertical: Spacing.xl },
  optionIcon: { fontSize: 38, marginBottom: 10 },
  optionTitle: { fontSize: 14, fontWeight: '800', textAlign: 'center', color: '#fff' },
  sectionLabel: { fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  gridItem: { width: '47.5%' },
  gridCard: {
    borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center',
    borderWidth: 1, ...Shadows.card,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', marginBottom: 10,
  },
  gridIcon: { fontSize: 24 },
  gridText: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
});
