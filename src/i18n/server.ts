import fs from 'node:fs/promises';
import { Locale, SUPPORTED_LOCALES, Translations } from '@/i18n/consts';

export async function loadTranslations(locale: Locale): Promise<Translations> {
  const translations = JSON.parse(await fs.readFile(`./src/i18n/${locale}.json`, 'utf-8'));

  translations.locale = locale;

  return translations as Translations;
}

export { SUPPORTED_LOCALES };
