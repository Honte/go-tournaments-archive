import EVENT_CONFIG from '@event/config';
import type { Locale } from '@/i18n/consts';

export const EVENT_LOCALES = EVENT_CONFIG.locales;
export const DEFAULT_LOCALE = EVENT_LOCALES[0];

export function isEventLocale(locale: string | undefined): locale is Locale {
  return EVENT_LOCALES.includes(locale as Locale);
}
