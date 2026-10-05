import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { t as translate, setLocale } from '../i18n';

const LANG_KEY = 'kanoonai_language';

export function useTranslation() {
  const [language, setLanguageState] = useState<'en' | 'hi'>('en');

  const loadLanguage = useCallback(async () => {
    const saved = await AsyncStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'hi') {
      setLocale(saved);
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = useCallback(async (lang: 'en' | 'hi') => {
    setLocale(lang);
    setLanguageState(lang);
    await AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  return { t: translate, language, setLanguage, loadLanguage };
}
