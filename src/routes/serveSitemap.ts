import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTournamentList } from '@/data/serverApi';
import { buildSitemap } from '@/data/sitemap';

export async function serveSitemap(event?: EventContext, localeParam?: string, otherEvents?: EventContext[]) {
  const check = localeParam?.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;

  if (!event || !isEventLocale(event, locale)) {
    return notFound();
  }

  const tournaments = await getTournamentList(event);
  const translations = await loadTranslations(event, locale);
  const sitemap = await buildSitemap(event, tournaments, translations, otherEvents);

  return Response.json(sitemap);
}

export async function getSitemapRouteOptions(event: EventContext) {
  return event.locales.map((locale) => ({
    locale: `${locale}.json`,
  }));
}
