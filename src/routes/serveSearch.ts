import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { getSearchIndex } from '@/data/serverApi';

export async function serveSearch(event?: EventContext, localeParam?: string) {
  const check = localeParam?.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;

  if (!event || !isEventLocale(event, locale)) {
    return notFound();
  }

  return Response.json(await getSearchIndex(event, locale));
}

export function getSearchRouteOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale: `${locale}.json` }));
}
