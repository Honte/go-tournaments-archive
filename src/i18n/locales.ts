import type { EventConfig } from '@/schema/event';
import type { Locale } from '@/i18n/consts';

export function isEventLocale(config: EventConfig, locale: string | undefined): locale is Locale {
  return config.locales.includes(locale as Locale);
}
