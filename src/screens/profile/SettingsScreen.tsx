import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../theme/ThemeContext';
import { Colors } from '../../theme/colors';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import SOSButton from '../../components/SOSButton';
import PressableScale from '../../components/PressableScale';
import { createSession } from '../../services/panicRecording';
import { useAuth } from '../../hooks/useAuth';

// ---- Sliding pill toggle with an animated indicator ----
function SlidingToggle<T extends string>({
  options, value, onChange,
}: {
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const [w, setW] = useState(0);
  const x = useRef(new Animated.Value(0)).current;
  const idx = Math.max(0, options.findIndex(o => o.key === value));

  useEffect(() => {
    Animated.spring(x, { toValue: idx, friction: 8, tension: 90, useNativeDriver: true }).start();
  }, [idx]);

  const half = (w - 8) / 2;
  const translateX = x.interpolate({ inputRange: [0, 1], outputRange: [0, half] });

  return (
    <View style={styles.track} onLayout={e => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <Animated.View style={[styles.indicator, { width: half, transform: [{ translateX }] }]}>
          <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
        </Animated.View>
      )}
      {options.map(o => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            style={styles.option}
            onPress={() => { Haptics.selectionAsync(); onChange(o.key); }}
          >
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { colors, theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    navigation.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
          <Text style={styles.backText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.settings')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t('profile.language')}</Text>
          <SlidingToggle
            options={[{ key: 'en', label: t('profile.english') }, { key: 'hi', label: t('profile.hindi') }]}
            value={language}
            onChange={setLanguage}
          />
        </View>

        {/* Theme */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t('profile.theme')}</Text>
          <SlidingToggle
            options={[{ key: 'light', label: t('profile.light') }, { key: 'dark', label: t('profile.dark') }]}
            value={theme}
            onChange={(th) => { if (th !== theme) toggleTheme(); }}
          />
        </View>

        {/* Change PIN */}
        <PressableScale
          onPress={() => navigation.navigate('PINSetup' as any)}
          style={[styles.section, styles.menuRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          haptic={false}
        >
          <View style={[styles.menuChip, { backgroundColor: Colors.primary + '22' }]}>
            <Ionicons name="key-outline" size={20} color={Colors.primary} />
          </View>
          <Text style={[styles.menuText, { color: colors.text }]}>{t('profile.changePIN')}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
        </PressableScale>

        <Text style={[styles.version, { color: colors.subtext }]}>KanoonAI v1.0.0</Text>
      </ScrollView>

      <SOSButton onStartRecording={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingTop: 56, paddingBottom: 18, paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  backText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: '900', color: '#fff' },
  content: { padding: Spacing.lg, paddingBottom: 110 },
  section: { borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: 12, borderWidth: 1, ...Shadows.card },
  sectionLabel: { fontSize: 13, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  track: {
    flexDirection: 'row', backgroundColor: 'rgba(148,163,184,0.18)',
    borderRadius: Radius.md, padding: 4, position: 'relative',
  },
  indicator: {
    position: 'absolute', top: 4, bottom: 4, left: 4,
    borderRadius: Radius.sm, overflow: 'hidden',
  },
  option: { flex: 1, paddingVertical: 11, alignItems: 'center', zIndex: 1 },
  optionText: { fontWeight: '700', color: '#64748b' },
  optionTextActive: { color: '#fff' },
  menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  menuChip: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, fontSize: 16, fontWeight: '600' },
  version: { textAlign: 'center', marginTop: 20, fontSize: 13 },
});
