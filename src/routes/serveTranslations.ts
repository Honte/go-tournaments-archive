import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';

export async function serveTranslations(event: EventContext, localeParam?: string) {
  const check = localeParam?.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;

  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  return Response.json(await loadTranslations(event, locale));
}

export async function getTranslationsRouteOptions(event: EventContext) {
  return event.locales.map((locale) => ({
    locale: `${locale}.json`,
  }));
}
