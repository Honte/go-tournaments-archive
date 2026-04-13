import type { Locale } from '@/i18n/consts';

export type EventConfig = {
  id: string;
  domain: string;
  defaultLocale: Locale;
  defaultCountry?: string;
  showCountry?: boolean;
  generatePngs?: boolean;
  generateSvgs?: boolean;
  hideGamesWithoutSgf?: boolean;
};
