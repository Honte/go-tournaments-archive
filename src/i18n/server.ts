import EVENT from '@event';
import fs from 'node:fs/promises';
import { merge } from 'lodash-es';
import { Locale, SUPPORTED_LOCALES, Translations } from '@/i18n/consts';

export async function loadTranslations(locale: Locale): Promise<Translations> {
  const baseTranslations = JSON.parse(await fs.readFile(`./src/i18n/${locale}.json`, 'utf-8'));
  const eventTranslations = JSON.parse(await fs.readFile(`./events/${EVENT}/i18n/${locale}.json`, 'utf-8'));
  const translations = merge({}, baseTranslations, eventTranslations);

  translations.locale = locale;

  return translations as Translations;
}

export { SUPPORTED_LOCALES };
