import React, { useState } from 'react';
import {
  Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../services/supabase';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { Gradients, Radius } from '../../theme/designSystem';
import { useTheme } from '../../theme/ThemeContext';
import { t } from '../../i18n';
import { useLanguage } from '../../i18n/LanguageContext';
import { triggerDevBypass } from '../../navigation/RootNavigator';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import AnimatedButton from '../../components/AnimatedButton';
import ScreenEnter from '../../components/ScreenEnter';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleLang = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('KanoonAI', t('auth.fillAllFields')); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert(t('common.error'), error.message);
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenEnter>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
            <LinearGradient colors={Gradients.brand} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.langInner}>
              <Text style={styles.langText}>{language === 'en' ? 'हिंदी' : 'English'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.logo}>⚖️ KanoonAI</Text>
          <Text style={[styles.title, { color: colors.text }]}>{t('auth.login')}</Text>

          <FloatingLabelInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FloatingLabelInput
            label={t('auth.password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <AnimatedButton label={t('auth.loginBtn')} onPress={handleLogin} variant="primary" loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={[styles.link, { color: colors.subtext }]}>
              {t('auth.noAccount')} <Text style={styles.linkBold}>{t('auth.signup')}</Text>
            </Text>
          </TouchableOpacity>

          {/* DEV ONLY — never rendered in production builds */}
          {__DEV__ && (
            <TouchableOpacity style={styles.devBypass} onPress={triggerDevBypass}>
              <Text style={styles.devBypassText}>Skip Login (Dev)</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </ScreenEnter>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, alignItems: 'center' },
  langToggle: { position: 'absolute', top: 56, right: 24 },
  langInner: { borderRadius: Radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  langText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  logo: { fontSize: 36, fontWeight: '900', color: Colors.primary, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 32 },
  btn: { width: '100%', marginTop: 4, marginBottom: 20 },
  link: { fontSize: 15 },
  linkBold: { color: Colors.primary, fontWeight: '700' },
  devBypass: { marginTop: 40, paddingVertical: 10, paddingHorizontal: 20 },
  devBypassText: { color: '#94a3b8', fontSize: 12, textAlign: 'center' },
});
