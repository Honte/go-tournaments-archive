import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTournamentList } from '@/data/serverApi';
import { getSitemap } from '@/data/sitemap';

export async function serveSitemap(event: EventContext, localeParam?: string) {
  const check = localeParam?.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;

  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const tournaments = await getTournamentList(event);
  const translations = await loadTranslations(event, locale);

  return Response.json(getSitemap(event, tournaments, translations));
}

export async function getSitemapRouteOptions(event: EventContext) {
  return event.locales.map((locale) => ({
    locale: `${locale}.json`,
  }));
}
