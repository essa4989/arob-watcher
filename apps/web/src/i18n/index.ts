import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { ar } from './ar';
import { en } from './en';
import { tl } from './tl';

export const SUPPORTED_LANGS = ['ar', 'en', 'tl'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const RTL_LANGS: Lang[] = ['ar'];

const STORAGE_KEY = 'aroob_lang';

export function getStoredLang(): Lang {
  const v = localStorage.getItem(STORAGE_KEY);
  return (SUPPORTED_LANGS as readonly string[]).includes(v ?? '') ? (v as Lang) : 'ar';
}

export function applyDirection(lang: Lang) {
  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
}

export function setLang(lang: Lang) {
  localStorage.setItem(STORAGE_KEY, lang);
  applyDirection(lang);
  void i18n.changeLanguage(lang);
}

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
    tl: { translation: tl },
  },
  lng: getStoredLang(),
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

applyDirection(getStoredLang());

export default i18n;
