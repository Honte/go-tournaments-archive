import type { EventDefinition } from '@/schema/event';
import type { Locale } from '@/i18n/consts';

export function isEventLocale(config: EventDefinition, locale: string | undefined): locale is Locale {
  return config.locales.includes(locale as Locale);
}
