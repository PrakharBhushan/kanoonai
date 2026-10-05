import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LearnStackParamList } from '../../navigation/types';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import SOSButton from '../../components/SOSButton';
import PressableScale from '../../components/PressableScale';
import EnterView from '../../components/EnterView';
import { createSession } from '../../services/panicRecording';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<LearnStackParamList, 'Topic'>;

const LESSON_TITLES: Record<string, string[]> = {
  tenant: ['Your Rights as a Tenant', 'Rent Control Laws', 'Eviction Protections', 'Security Deposit Rules', 'Dispute Resolution'],
  police: ['Rights During a Police Stop', 'Arrest Procedures', 'Your Right to a Lawyer', 'FIR Filing Rights', 'Bail and Custody Rights'],
  consumer: ['Consumer Protection Act 2019', 'Filing a Consumer Complaint', 'Product Liability', 'E-Commerce Consumer Rights', 'Consumer Court Process'],
  women: ['POSH Act Basics', 'Domestic Violence Act', 'Women in Workplace', 'Property Rights', 'Constitutional Protections'],
  rti: ['What is RTI?', 'How to File RTI', 'Public Information Officers', 'RTI Appeals', 'RTI Exemptions'],
  workplace: ['Minimum Wage Rights', 'Working Hours & Overtime', 'Leave Entitlements', 'Termination Rights', 'Grievance Mechanisms'],
};

export default function TopicScreen({ route, navigation }: Props) {
  const { topicId, topicTitle } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const lessons = LESSON_TITLES[topicId] ?? [];

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    nav.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{topicTitle}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {lessons.map((title, idx) => (
          <EnterView key={idx} delay={idx * 70} offset={16}>
            <PressableScale
              onPress={() => navigation.navigate('Lesson', {
                lessonId: `${topicId}_${idx + 1}`,
                topicId,
                lessonTitle: title,
                lessonNumber: idx + 1,
              })}
              style={[styles.lessonCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={styles.lessonLeft}>
                <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.numCircle}>
                  <Text style={styles.numText}>{idx + 1}</Text>
                </LinearGradient>
                <View style={styles.lessonTextArea}>
                  <Text style={[styles.lessonTitle, { color: colors.text }]}>{title}</Text>
                  <Text style={styles.lessonMeta}>+200 XP</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.subtext} />
            </PressableScale>
          </EnterView>
        ))}
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
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '800', flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 110 },
  lessonCard: {
    flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, padding: 16,
    marginBottom: 10, borderWidth: 1, ...Shadows.card,
  },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  numCircle: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  numText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  lessonTextArea: { flex: 1 },
  lessonTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  lessonMeta: { fontSize: 12, color: Colors.warning, fontWeight: '700' },
});
