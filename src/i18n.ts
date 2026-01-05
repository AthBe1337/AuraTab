import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import zh from './locales/zh.json';

i18n
  // 检测用户当前语言
  .use(LanguageDetector)
  // 注入 react-i18next
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      zh: { translation: zh },
      'zh-CN': { translation: zh }, // 兼容 zh-CN
    },
    fallbackLng: 'en', // 默认语言
    debug: false,
    interpolation: {
      escapeValue: false, // React 已经处理了 XSS，不需要 i18next 再处理
    },
    detection: {
      // 优先从 localStorage 读取，没有再看浏览器语言
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], 
    }
  });

export default i18n;
