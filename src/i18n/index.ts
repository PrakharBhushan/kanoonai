import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import en from './en';
import hi from './hi';

const i18n = new I18n({ en, hi });
i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'en';
i18n.enableFallback = true;

export const t = (key: string, options?: object) => i18n.t(key, options);
export const setLocale = (locale: 'en' | 'hi') => { i18n.locale = locale; };
export default i18n;
