import React, { useState } from 'react';
import {
  Text, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { supabase } from '../../services/supabase';
import { AuthStackParamList } from '../../navigation/types';
import { Colors } from '../../theme/colors';
import { useTheme } from '../../theme/ThemeContext';
import { t } from '../../i18n';
import FloatingLabelInput from '../../components/FloatingLabelInput';
import AnimatedButton from '../../components/AnimatedButton';
import ScreenEnter from '../../components/ScreenEnter';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('KanoonAI', t('auth.fillAllFields'));
      return;
    }
    setLoading(true);
    // Pass the name as user metadata so the DB trigger can populate the profile row
    // server-side (RLS-safe) even when no client session exists yet.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      Alert.alert(t('common.error'), error.message);
      setLoading(false);
      return;
    }

    // Email-confirmation ON => signUp returns no session. Inserting the profile now
    // would fail RLS (auth.uid() is null), and RootNavigator can't advance without a
    // session. Tell the user to confirm their email, then send them to Login.
    if (!data.session) {
      setLoading(false);
      Alert.alert('KanoonAI', t('auth.confirmEmailSent'), [
        { text: t('common.ok'), onPress: () => navigation.navigate('Login') },
      ]);
      return;
    }

    // Email-confirmation OFF => session is active. The DB trigger normally creates the
    // profile row; this upsert is an idempotent fallback (RLS-safe now that auth.uid()
    // matches). RootNavigator will switch to PIN setup automatically once the session
    // is observed — no manual navigation needed.
    const { error: profileError } = await supabase.from('users').upsert({
      id: data.session.user.id,
      name,
      email,
      xp: 0,
      streak: 0,
      plan: 'free',
    });
    if (profileError) {
      console.warn('Profile upsert failed (DB trigger may handle it):', profileError.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.bg }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenEnter>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>⚖️ KanoonAI</Text>
          <Text style={[styles.title, { color: colors.text }]}>{t('auth.signup')}</Text>

          <FloatingLabelInput label={t('auth.name')} value={name} onChangeText={setName} />
          <FloatingLabelInput
            label={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <FloatingLabelInput label={t('auth.password')} value={password} onChangeText={setPassword} secureTextEntry />

          <AnimatedButton label={t('auth.signupBtn')} onPress={handleSignup} variant="primary" loading={loading} style={styles.btn} />

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.link, { color: colors.subtext }]}>
              {t('auth.haveAccount')} <Text style={styles.linkBold}>{t('auth.login')}</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </ScreenEnter>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: '900', color: Colors.primary, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 32 },
  btn: { width: '100%', marginTop: 4, marginBottom: 20 },
  link: { fontSize: 15 },
  linkBold: { color: Colors.primary, fontWeight: '700' },
});
