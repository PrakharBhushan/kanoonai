import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmergencyStackParamList } from '../../navigation/types';
import { queryEmergency } from '../../services/gemini';
import { useTheme } from '../../theme/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { t } from '../../i18n';
import { Colors } from '../../theme/colors';
import { Gradients, Radius, Spacing, Shadows } from '../../theme/designSystem';
import SOSButton from '../../components/SOSButton';
import AnimatedButton from '../../components/AnimatedButton';
import PressableScale from '../../components/PressableScale';
import ScreenEnter from '../../components/ScreenEnter';
import { createSession } from '../../services/panicRecording';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

type Props = NativeStackScreenProps<EmergencyStackParamList, 'EmergencyInput'>;

export default function EmergencyInputScreen({ route, navigation }: Props) {
  const { mode, category } = route.params;
  const { colors } = useTheme();
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [text, setText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [responseLang, setResponseLang] = useState<'en' | 'hi'>('en');
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('kanoonai_language').then(l => {
      if (l === 'en' || l === 'hi') setResponseLang(l);
    });
    if (mode === 'photo') pickImage();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const categoryLabel = category
    ? t(`emergency.preloadedIssues.${category}`)
    : mode === 'describe' ? t('emergency.describe') : t('emergency.photo');

  const handleSubmit = async () => {
    const query = text.trim();
    if (query.length < 10) {
      Alert.alert('KanoonAI', 'Please describe your situation in at least 10 characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await queryEmergency(query, category ?? mode, responseLang);
      navigation.navigate('EmergencyResult', { response, query, category: categoryLabel });
    } catch (err) {
      Alert.alert(t('common.error'), (err as Error).message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSOS = () => {
    if (!user) return;
    const sessionId = createSession(user.id);
    nav.navigate('PanicRecording', { sessionId, userId: user.id });
  };

  const valid = text.trim().length >= 10;
  const counterColor = text.length > 460 ? Colors.warning : valid ? Colors.success : colors.subtext;

  return (
    <View style={[styles.root, { backgroundColor: colors.bg }]}>
      <LinearGradient colors={Gradients.emergency} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryLabel}</Text>
      </LinearGradient>

      <ScreenEnter>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {imageUri && (
            <View style={styles.imagePreview}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <TouchableOpacity onPress={pickImage} style={styles.changePhoto}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.label, { color: colors.text }]}>{t('emergency.describe')}</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: colors.card, color: colors.text, borderColor: focused ? Colors.primary : colors.border },
              focused && Shadows.glow(Colors.primary),
            ]}
            placeholder={t('emergency.inputPlaceholder')}
            placeholderTextColor={colors.subtext}
            value={text}
            onChangeText={setText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.charCount, { color: counterColor }]}>{text.length}/500</Text>

          {/* Language selector */}
          <Text style={[styles.label, { color: colors.text }]}>Response Language / उत्तर की भाषा</Text>
          <View style={styles.langRow}>
            {(['en', 'hi'] as const).map(l => {
              const active = responseLang === l;
              return (
                <PressableScale key={l} onPress={() => setResponseLang(l)} style={styles.langFlex} haptic={false}>
                  {active ? (
                    <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.langBtn}>
                      <Text style={styles.langTextActive}>{l === 'en' ? 'English' : 'हिंदी'}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={[styles.langBtn, styles.langBtnInactive, { borderColor: colors.border, backgroundColor: colors.card }]}>
                      <Text style={[styles.langText, { color: colors.subtext }]}>{l === 'en' ? 'English' : 'हिंदी'}</Text>
                    </View>
                  )}
                </PressableScale>
              );
            })}
          </View>

          <AnimatedButton
            label={loading ? t('emergency.searching') : t('emergency.getHelp')}
            onPress={handleSubmit}
            variant="emergency"
            loading={loading}
            icon="sparkles"
          />

          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.success} />
            <Text style={[styles.infoText, { color: colors.subtext }]}>
              {t('emergency.disclaimer')}
            </Text>
          </View>
        </ScrollView>
      </ScreenEnter>

      <SOSButton onStartRecording={handleSOS} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 56, paddingBottom: 18, paddingHorizontal: Spacing.lg,
    borderBottomLeftRadius: Radius.lg, borderBottomRightRadius: Radius.lg,
  },
  backBtn: { marginRight: 12 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '800', flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 110 },
  imagePreview: { marginBottom: 16, borderRadius: Radius.md, overflow: 'hidden', ...Shadows.card },
  image: { width: '100%', height: 200 },
  changePhoto: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, alignItems: 'center' },
  changePhotoText: { color: '#fff', fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 8 },
  input: {
    borderRadius: Radius.md, borderWidth: 1.5, padding: 14, fontSize: 15,
    minHeight: 130, lineHeight: 22,
  },
  charCount: { fontSize: 12, textAlign: 'right', marginTop: 6, marginBottom: 16, fontWeight: '600' },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  langFlex: { flex: 1 },
  langBtn: { borderRadius: Radius.sm, paddingVertical: 12, alignItems: 'center' },
  langBtnInactive: { borderWidth: 1.5 },
  langText: { fontWeight: '700' },
  langTextActive: { color: '#fff', fontWeight: '800' },
  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: Radius.md, borderWidth: 1, padding: 14, marginTop: 20,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
});
