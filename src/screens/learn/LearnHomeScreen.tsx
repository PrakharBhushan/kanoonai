import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { useUser } from '../../hooks/useUser';
import { useTheme } from '../../theme/ThemeContext';
import { t } from '../../i18n';
import { Gradients, Radius, Spacing } from '../../theme/designSystem';
import SOSButton from '../../components/SOSButton';
import XPBar from '../../components/XPBar';
import StreakBadge from '../../components/StreakBadge';
import TopicCard from '../../components/TopicCard';
import EnterView from '../../components/EnterView';
import { Colors } from '../../theme/colors';
import { createSession } from '../../services/panicRecording';

const TOPICS = [
  { id: 'tenant', icon: '🏠', color: '#0ea5e9', locked: false, proOnly: false },
  { id: 'police', icon: '🚨', color: Colors.emergency, locked: false, proOnly: false },
  { id: 'consumer', icon: '🛒', color: Colors.success, locked: true, proOnly: false },
  { id: 'women', icon: '🌸', color: '#ec4899', locked: true, proOnly: true },
  { id: 'rti', icon: '📋', color: Colors.warning, locked: true, proOnly: true },
  { id: 'workplace', icon: '💼', color: Colors.purple, locked: true, proOnly: true },
];

export default function LearnHomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const userData = useUser(user?.id);
  const { colors } = useTheme();

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    navigation.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{t('learn.title')}</Text>
          <StreakBadge streak={userData.streak} />
        </View>
        <XPBar xp={userData.xp} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: colors.subtext }]}>{t('learn.topicsTitle')}</Text>
        {TOPICS.map((topic, i) => (
          <EnterView key={topic.id} delay={i * 70} offset={16}>
            <TopicCard
              title={t(`learn.topics.${topic.id}`)}
              icon={topic.icon}
              color={topic.color}
              lessonsTotal={5}
              lessonsDone={0}
              locked={topic.locked}
              proOnly={topic.proOnly}
              onPress={() => navigation.navigate('Topic', {
                topicId: topic.id,
                topicTitle: t(`learn.topics.${topic.id}`),
              })}
            />
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
    paddingTop: 56, paddingBottom: 16,
    borderBottomLeftRadius: Radius.xl, borderBottomRightRadius: Radius.xl,
  },
  headerTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, marginBottom: 8,
  },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: '900' },
  content: { padding: Spacing.lg, paddingBottom: 110 },
  sectionLabel: {
    fontSize: 13, fontWeight: '800', textTransform: 'uppercase',
    letterSpacing: 0.5, marginBottom: 14,
  },
});
