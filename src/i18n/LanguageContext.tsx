import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { setLocale } from './index';

export type Language = 'en' | 'hi';

const LANG_KEY = 'kanoonai_language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'en',
  setLanguage: () => {},
});

/**
 * Holds the active language, hydrates it from storage (or the device locale) at boot,
 * and persists changes. Because screens read the i18n-js singleton at render time,
 * the app remounts when `language` changes (see App.tsx keying RootNavigator) so every
 * t() call re-evaluates in the new language.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(LANG_KEY);
      const deviceLang = Localization.getLocales()[0]?.languageCode === 'hi' ? 'hi' : 'en';
      const initial: Language = saved === 'hi' || saved === 'en' ? saved : deviceLang;
      setLocale(initial);
      setLanguageState(initial);
      setReady(true);
    })();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLocale(lang);
    setLanguageState(lang);
    AsyncStorage.setItem(LANG_KEY, lang).catch(() => {});
  }, []);

  // Block first paint until the saved language is applied, so the UI never flashes
  // the wrong language on launch.
  if (!ready) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
