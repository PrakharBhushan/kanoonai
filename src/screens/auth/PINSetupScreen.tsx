import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { setPIN } from '../../utils/pin';
import { refreshPINCheck } from '../../navigation/RootNavigator';
import { Gradients, Spacing } from '../../theme/designSystem';
import { t } from '../../i18n';
import PINPad from '../../components/PINPad';
import ScreenEnter from '../../components/ScreenEnter';

type Props = NativeStackScreenProps<any, any>;

export default function PINSetupScreen({ navigation }: Props) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [firstPIN, setFirstPIN] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePIN = async (pin: string) => {
    if (step === 'enter') {
      setFirstPIN(pin);
      setStep('confirm');
      return;
    }
    if (pin !== firstPIN) {
      setError(t('auth.pinMismatch'));
      setTimeout(() => { setError(null); setStep('enter'); setFirstPIN(''); }, 1500);
      return;
    }
    await setPIN(pin);
    Alert.alert('KanoonAI', t('auth.pinSaved'), [
      { text: t('common.ok'), onPress: () => refreshPINCheck() },
    ]);
  };

  return (
    <LinearGradient colors={Gradients.brandDeep} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
      <ScreenEnter style={styles.inner}>
        <View style={styles.iconBadge}>
          <Ionicons name="shield-checkmark" size={40} color="#fff" />
        </View>
        <Text style={styles.title}>{t('auth.pinSetupTitle')}</Text>
        <Text style={styles.desc}>{t('auth.pinSetupDesc')}</Text>
        <Text style={styles.step}>{step === 'enter' ? t('auth.pinSetupTitle') : t('auth.pinConfirm')}</Text>
        <PINPad
          onComplete={handlePIN}
          label={step === 'confirm' ? t('auth.pinConfirm') : t('auth.pinSetupTitle')}
          error={error}
        />
      </ScreenEnter>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  iconBadge: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: '900', color: '#fff', textAlign: 'center', marginBottom: 12 },
  desc: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 16, lineHeight: 22 },
  step: { fontSize: 15, color: '#bfdbfe', textAlign: 'center', marginBottom: 24, fontWeight: '700' },
});
