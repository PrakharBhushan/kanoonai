import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmergencyStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import DisclaimerBox from '../../components/DisclaimerBox';
import LawSourceTag from '../../components/LawSourceTag';
import SOSButton from '../../components/SOSButton';
import PressableScale from '../../components/PressableScale';
import EnterView from '../../components/EnterView';
import { createSession } from '../../services/panicRecording';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<EmergencyStackParamList, 'EmergencyResult'>;

function extractSources(text: string): string[] {
  const matches = text.match(/Section\s[\w\s]+,\s[A-Za-z\s]+\d{4}/g) ?? [];
  return [...new Set(matches)].slice(0, 6);
}

function parseResponse(raw: string) {
  const sections: Array<{ title: string; content: string }> = [];
  const markers = ['SUMMARY', 'WHAT LAW SAYS', 'YOUR RIGHTS', 'STEPS TO TAKE', 'LAW SOURCES', 'DISCLAIMER'];
  let remaining = raw;

  for (let i = 0; i < markers.length; i++) {
    const marker = markers[i];
    const idx = remaining.toUpperCase().indexOf(marker);
    if (idx === -1) continue;
    const nextIdx = markers.slice(i + 1).reduce((best, m) => {
      const pos = remaining.toUpperCase().indexOf(m, idx + marker.length);
      return pos !== -1 && (best === -1 || pos < best) ? pos : best;
    }, -1);
    const content = (nextIdx !== -1 ? remaining.slice(idx + marker.length, nextIdx) : remaining.slice(idx + marker.length))
      .replace(/^[:\s\-*]+/, '').trim();
    if (content) sections.push({ title: marker, content });
  }
  return sections.length > 0 ? sections : [{ title: 'Response', content: raw }];
}

export default function EmergencyResultScreen({ route, navigation }: Props) {
  const { response, query, category } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const nav = useNavigation<any>();
  const [saved, setSaved] = useState(false);
  const sources = extractSources(response);
  const sections = parseResponse(response);

  const handleSave = async () => {
    if (!user) return;
    await supabase.from('emergency_queries').insert({
      user_id: user.id, query, category, response, created_at: new Date().toISOString(),
    });
    setSaved(true);
    Alert.alert('KanoonAI', 'Saved successfully!');
  };

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    nav.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  let delay = 0;
  const nextDelay = () => { delay += 90; return delay; };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('emergency.title')}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Situation */}
        <EnterView delay={nextDelay()}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardLabel, { color: colors.subtext }]}>{t('emergency.situation')}</Text>
            <Text style={[styles.queryText, { color: colors.text }]}>{query}</Text>
            <Text style={[styles.categoryText, { color: Colors.primary }]}>{category}</Text>
          </View>
        </EnterView>

        {/* Parsed response sections */}
        {sections.map((sec, i) => (
          <EnterView key={i} delay={nextDelay()}>
            <View style={[styles.card, styles.accentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: Colors.primary }]}>{sec.title}</Text>
              <Text style={[styles.sectionContent, { color: colors.text }]}>{sec.content}</Text>
            </View>
          </EnterView>
        ))}

        {/* Law sources */}
        {sources.length > 0 && (
          <EnterView delay={nextDelay()}>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardLabel, { color: colors.subtext }]}>{t('emergency.sources')}</Text>
              <LawSourceTag sources={sources} />
            </View>
          </EnterView>
        )}

        <EnterView delay={nextDelay()}>
          <DisclaimerBox />
        </EnterView>

        {/* Action buttons */}
        <EnterView delay={nextDelay()}>
          <View style={styles.actions}>
            <PressableScale onPress={saved ? undefined : handleSave} disabled={saved} style={styles.actionFlex}>
              <LinearGradient colors={saved ? Gradients.success : Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionBtn}>
                <Ionicons name={saved ? 'checkmark-circle' : 'bookmark-outline'} size={20} color="#fff" />
                <Text style={styles.actionText}>{t('emergency.save')}</Text>
              </LinearGradient>
            </PressableScale>
            <PressableScale onPress={() => Linking.openURL('tel:15100')} style={styles.actionFlex}>
              <LinearGradient colors={Gradients.emergency} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionBtn}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.actionText}>NALSA 15100</Text>
              </LinearGradient>
            </PressableScale>
            <PressableScale onPress={() => navigation.popToTop()} style={styles.actionFlex}>
              <LinearGradient colors={Gradients.slate} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.actionBtn}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.actionText}>{t('emergency.newQuery')}</Text>
              </LinearGradient>
            </PressableScale>
          </View>
        </EnterView>
      </ScrollView>

      <SOSButton onStartRecording={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingBottom: 18, paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  card: {
    borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: 12,
    borderWidth: 1, ...Shadows.card,
  },
  accentCard: { borderLeftWidth: 4, borderLeftColor: Colors.primary },
  cardLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginBottom: 6, letterSpacing: 0.5 },
  queryText: { fontSize: 15, lineHeight: 22 },
  categoryText: { fontSize: 13, fontWeight: '700', marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '800', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.5 },
  sectionContent: { fontSize: 15, lineHeight: 24 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  actionFlex: { flex: 1 },
  actionBtn: {
    borderRadius: Radius.md, paddingVertical: 13,
    alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
    ...Shadows.pressable,
  },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
