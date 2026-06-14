import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { getTournamentList } from '@/data';
import { getSitemap } from '@/data/sitemap';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export async function GET(_: Request, props: PageProps) {
  const event = await loadDefaultEvent();
  const { locale: localeParam } = await props.params;
  const check = localeParam.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;

  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  const tournaments = await getTournamentList();
  const translations = await loadTranslations(event, locale);

  return Response.json(getSitemap(event, tournaments, translations));
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();

  return event.locales.map((locale) => ({ locale: `${locale}.json` }));
}
