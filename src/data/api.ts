import type { Locale, Translations } from '@/i18n/consts';

export async function fetchTranslations(locale: Locale) {
  const response = await fetch(`/data/i18n/${locale}.json`);

  if (!response.ok) {
    throw new Error(`Could not load translations for ${locale}`);
  }

  return (await response.json()) as Translations;
}
