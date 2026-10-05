import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LearnStackParamList } from '../../navigation/types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../theme/ThemeContext';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import HeartDisplay from '../../components/HeartDisplay';
import MCQOption from '../../components/MCQOption';
import SOSButton from '../../components/SOSButton';
import { createSession } from '../../services/panicRecording';
import { useNavigation } from '@react-navigation/native';
import { loseHeart, getHearts } from '../../utils/hearts';
import * as Haptics from 'expo-haptics';
import AnimatedButton from '../../components/AnimatedButton';
import AnimatedProgressBar from '../../components/AnimatedProgressBar';
import { Gradients } from '../../theme/designSystem';

const QUESTION_BANK: Record<string, Array<{
  scenario: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  lawSource: string;
}>> = {
  tenant: [
    {
      scenario: 'Ravi has been renting an apartment for 2 years. His landlord suddenly tells him to vacate in 3 days.',
      question: 'What is the minimum notice period a landlord must give for eviction in most Indian states?',
      options: ['3 days', '15 days', '30 days', '60 days'],
      correct: 2,
      explanation: 'Under most state Rent Control Acts, a landlord must give at least 30 days written notice before seeking eviction.',
      lawSource: 'Delhi Rent Control Act, Section 14',
    },
    {
      scenario: 'Priya paid ₹50,000 security deposit. When she left, the landlord refused to return it.',
      question: 'What can Priya do to get her security deposit back?',
      options: ["Nothing — it's landlord's discretion", 'File a consumer complaint', 'Send legal notice then approach Rent Court', 'Call police'],
      correct: 2,
      explanation: 'A security deposit must be returned within 30 days of vacating. Priya can send a legal notice and approach the Rent Court.',
      lawSource: 'Model Tenancy Act 2021, Section 11',
    },
    {
      scenario: "Suresh's landlord entered his apartment without permission while he was away.",
      question: "Does a landlord have the right to enter the rented premises without tenant's consent?",
      options: ['Yes, anytime', 'Yes, with 24 hour notice', 'No, not without consent except emergency', 'Only during daytime'],
      correct: 2,
      explanation: "A landlord cannot enter the rented premises without the tenant's prior consent except in genuine emergencies.",
      lawSource: 'Model Tenancy Act 2021, Section 16',
    },
    {
      scenario: "Meena's landlord wants to increase rent by 50% suddenly.",
      question: 'Under rent control laws, how much can a landlord increase rent annually?',
      options: ['Any amount', 'Maximum 50%', 'Only as per state Rent Control Act (usually 5-10%)', 'Cannot increase at all'],
      correct: 2,
      explanation: 'Rent increases are regulated by state Rent Control Acts. Most states allow 5-10% annual increase with proper notice.',
      lawSource: 'State Rent Control Acts, various sections',
    },
    {
      scenario: "Amit's landlord refused to give a rent receipt.",
      question: 'Is a landlord legally required to provide rent receipts?',
      options: ['No, receipts are optional', 'Yes, for any rent above ₹3000/month', 'Only if tenant asks', 'Only for commercial property'],
      correct: 1,
      explanation: 'Landlords are legally required to provide rent receipts. This is important for tax purposes and as proof of payment.',
      lawSource: 'Income Tax Act + State Rent Control Acts',
    },
  ],
  police: [
    {
      scenario: "Police stopped Rahul on the street and demanded his phone's passcode.",
      question: 'Are you legally required to give your phone passcode to police?',
      options: ['Yes, always', 'No, you have right against self-incrimination', 'Only if they have a warrant', 'Yes, if they suspect a crime'],
      correct: 1,
      explanation: 'Under Article 20(3) of the Constitution, no one can be compelled to be a witness against themselves.',
      lawSource: 'Constitution of India, Article 20(3)',
    },
    {
      scenario: "Police arrested Sunita but didn't tell her why she was being arrested.",
      question: 'What is the legal right of an arrested person regarding knowing the reason for arrest?',
      options: ['They have no such right', 'They must be told the reason for arrest immediately', 'Reason can be told within 24 hours', 'Only if they ask through a lawyer'],
      correct: 1,
      explanation: 'Under Section 50 BNSS (CrPC), police must inform the arrested person of the grounds of arrest.',
      lawSource: 'BNSS Section 50 (formerly CrPC Section 50)',
    },
    {
      scenario: 'Vijay was arrested and held for 36 hours without being produced before a magistrate.',
      question: 'Within how many hours must an arrested person be produced before a magistrate?',
      options: ['12 hours', '24 hours', '48 hours', '72 hours'],
      correct: 1,
      explanation: 'Article 22 of the Constitution and Section 57 BNSS require that an arrested person be produced before a magistrate within 24 hours.',
      lawSource: 'Constitution Article 22, BNSS Section 57',
    },
    {
      scenario: "Police want to search Kavya's house.",
      question: 'Can police search your home without a warrant?',
      options: ['Yes, anytime', 'No, never', 'Only in emergencies or cognizable offences', 'Only with senior officer permission'],
      correct: 2,
      explanation: 'Police can search without a warrant for cognizable offences or in emergencies, but must follow procedure under BNSS Sections 185-187.',
      lawSource: 'BNSS Sections 185-187 (formerly CrPC)',
    },
    {
      scenario: 'Deepak wants to file a complaint against a police officer for misconduct.',
      question: 'Where can you file a complaint against police misconduct?',
      options: ['Cannot complain against police', 'Only to the same police station', 'State Human Rights Commission, Police Complaints Authority, or High Court', 'Only to the Home Ministry'],
      correct: 2,
      explanation: 'You can complain to the SP, State Human Rights Commission, Police Complaints Authority (where set up), or file a writ petition in the High Court.',
      lawSource: 'Supreme Court guidelines in Prakash Singh case 2006',
    },
  ],
};

const DEFAULT_QUESTIONS = QUESTION_BANK['tenant'];

type Props = NativeStackScreenProps<LearnStackParamList, 'Lesson'>;
type AnswerState = 'default' | 'selected' | 'correct' | 'wrong';

export default function LessonScreen({ route, navigation }: Props) {
  const { lessonId, topicId, lessonTitle } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const nav = useNavigation<any>();

  const questions = QUESTION_BANK[topicId] ?? DEFAULT_QUESTIONS;
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hearts, setHearts] = useState(3);
  const [showNoHearts, setShowNoHearts] = useState(false);

  const feedbackAnim = useRef(new Animated.ValueXY({ x: 0, y: 100 })).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => { getHearts().then(setHearts); }, []);

  const currentQ = questions[qIndex];
  const isCorrect = selectedOption === currentQ.correct;

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = async () => {
    if (selectedOption === null) return;
    setSubmitted(true);

    if (!isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      const remaining = await loseHeart();
      setHearts(remaining);
      if (remaining === 0) setTimeout(() => setShowNoHearts(true), 800);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    Animated.parallel([
      Animated.timing(feedbackAnim.y, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  };

  const handleNext = () => {
    Animated.parallel([
      Animated.timing(feedbackAnim.y, { toValue: 100, duration: 200, useNativeDriver: true }),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (qIndex < questions.length - 1) {
        setQIndex(q => q + 1);
        setSelectedOption(null);
        setSubmitted(false);
        feedbackAnim.setValue({ x: 0, y: 100 });
        feedbackOpacity.setValue(0);
      } else {
        if (user) {
          supabase.from('user_progress').upsert({
            user_id: user.id, lesson_id: lessonId, topic_id: topicId,
            completed_at: new Date().toISOString(),
          });
          supabase.rpc('add_xp', { user_id: user.id, amount: 200 });
        }
        navigation.replace('LessonComplete', { xpEarned: 200, lessonTitle, topicId });
      }
    });
  };

  const getOptionState = (idx: number): AnswerState => {
    if (!submitted) return selectedOption === idx ? 'selected' : 'default';
    if (idx === currentQ.correct) return 'correct';
    if (idx === selectedOption && !isCorrect) return 'wrong';
    return 'default';
  };

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    nav.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  if (showNoHearts) {
    return (
      <View style={[styles.root, { backgroundColor: colors.bg }]}>
        <View style={styles.noHeartsModal}>
          <Text style={styles.noHeartsTitle}>{t('learn.noHearts')}</Text>
          <Text style={styles.noHeartsDesc}>{t('learn.noHeartsDesc')}</Text>
          <TouchableOpacity style={styles.restartBtn} onPress={() => {
            setQIndex(0); setSelectedOption(null); setSubmitted(false);
            setHearts(3); setShowNoHearts(false);
          }}>
            <Text style={styles.restartText}>{t('learn.restartLesson')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>{t('learn.backToTopics')}</Text>
          </TouchableOpacity>
        </View>
        <SOSButton onStartRecording={handleSOS} />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.subtext} />
        </TouchableOpacity>
        <View style={styles.progressWrap}>
          <AnimatedProgressBar progress={qIndex / questions.length} fillColors={Gradients.brand} height={10} />
        </View>
        <HeartDisplay hearts={hearts} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.qLabel, { color: colors.subtext }]}>
          {t('learn.question')} {qIndex + 1} {t('learn.of')} {questions.length}
        </Text>

        <View style={[styles.scenarioCard, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.scenarioText}>{currentQ.scenario}</Text>
        </View>

        <Text style={[styles.question, { color: colors.text }]}>{currentQ.question}</Text>

        {currentQ.options.map((opt, idx) => (
          <MCQOption
            key={idx}
            letter={['A', 'B', 'C', 'D'][idx]}
            text={opt}
            state={getOptionState(idx)}
            onPress={() => handleSelect(idx)}
            disabled={submitted}
          />
        ))}

        {!submitted && selectedOption !== null && (
          <AnimatedButton label={t('learn.submit')} onPress={handleSubmit} variant="primary" style={styles.submitSpacing} />
        )}

        {submitted && (
          <Animated.View
            style={[
              styles.explanation,
              { backgroundColor: isCorrect ? '#dcfce7' : '#fee2e2' },
              { opacity: feedbackOpacity, transform: [{ translateY: feedbackAnim.y }] },
            ]}
          >
            <Text style={[styles.explanationTitle, { color: isCorrect ? Colors.success : Colors.emergency }]}>
              {isCorrect ? t('learn.correct') : t('learn.wrong')}
            </Text>
            <Text style={styles.lawSourceText}>📚 {t('learn.lawSource')}: {currentQ.lawSource}</Text>
            <Text style={styles.explanationText}>{currentQ.explanation}</Text>
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextText}>
                {qIndex < questions.length - 1 ? t('learn.nextQuestion') : t('learn.lessonComplete')} →
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      <SOSButton onStartRecording={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingBottom: 16, paddingHorizontal: 16,
  },
  progressWrap: { flex: 1 },
  content: { padding: 16, paddingTop: 20, paddingBottom: 120 },
  qLabel: { fontSize: 13, fontWeight: '600', marginBottom: 12 },
  scenarioCard: { borderRadius: 12, padding: 16, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: Colors.primary },
  scenarioText: { fontSize: 14, lineHeight: 22, color: '#1e40af' },
  question: { fontSize: 18, fontWeight: '700', lineHeight: 28, marginTop: 4, marginBottom: 20 },
  submitSpacing: { marginTop: 8 },
  explanation: { borderRadius: 14, padding: 16, marginTop: 8 },
  explanationTitle: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  lawSourceText: { fontSize: 13, fontWeight: '700', color: Colors.primary, marginBottom: 8 },
  explanationText: { fontSize: 14, lineHeight: 22, color: '#1e293b', marginBottom: 16 },
  nextBtn: { backgroundColor: '#1e293b', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  noHeartsModal: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  noHeartsTitle: { fontSize: 28, fontWeight: '900', color: Colors.emergency, marginBottom: 12 },
  noHeartsDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  restartBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
    paddingHorizontal: 32, alignItems: 'center', marginBottom: 16,
  },
  restartText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  backLink: { color: Colors.primary, fontSize: 15, fontWeight: '600' },
});
