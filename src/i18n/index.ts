import { en } from './locales/en';
import { zh } from './locales/zh';

export type Language = 'en' | 'zh';
export type TranslationKey = keyof typeof en;

export const translations: Record<Language, Record<string, string>> = {
  en,
  zh,
};
