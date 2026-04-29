import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import ptBR from './locales/pt-BR.json';

if (!i18n.isInitialized) {
  void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: { 'pt-BR': { translation: ptBR } },
      fallbackLng: 'pt-BR',
      supportedLngs: ['pt-BR'],
      interpolation: { escapeValue: false },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'tos:locale',
      },
      returnNull: false,
    });
}

export { i18n };
