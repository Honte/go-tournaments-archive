import fs from 'node:fs/promises';
import { merge } from 'lodash-es';
import type { EventConfig } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';

export async function loadTranslations(event: EventConfig, locale?: Locale): Promise<Translations> {
  const requestedLocale = locale ?? event.locales[0];
  const baseTranslations = JSON.parse(await fs.readFile(`./src/i18n/${requestedLocale}.json`, 'utf-8'));
  const eventTranslations = JSON.parse(await fs.readFile(`./events/${event.id}/i18n/${requestedLocale}.json`, 'utf-8'));
  const translations = merge({}, baseTranslations, eventTranslations);

  translations.locale = requestedLocale;

  return translations as Translations;
}

export async function loadAllTranslations(event: EventConfig) {
  const translations = await Promise.all(event.locales.map((locale) => loadTranslations(event, locale)));

  return translations.reduce((acc, translation) => ({ ...acc, [translation.locale]: translation }), {}) as Record<
    Locale,
    Translations
  >;
}
