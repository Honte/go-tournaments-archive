import type { Locale, LocalizedString } from '@/i18n/consts';

export function getString(value?: LocalizedString, locale?: Locale, fallbackValue?: string) {
  if (!value) {
    return fallbackValue;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (!locale) {
    return fallbackValue;
  }

  return value[locale] ?? fallbackValue;
}
