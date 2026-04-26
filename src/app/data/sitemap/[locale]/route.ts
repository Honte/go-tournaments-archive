import { getTournamentList } from '@/data';
import { notFound } from 'next/navigation';
import { type Locale, SUPPORTED_LOCALES } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getSitemap } from '@/data/sitemap';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export async function GET(_: Request, props: PageProps) {
  const { locale: localeParam } = await props.params;
  const check = localeParam.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;

  if (!locale || !SUPPORTED_LOCALES.includes(locale)) {
    return notFound();
  }

  const tournaments = await getTournamentList();
  const translations = await loadTranslations(locale);

  return Response.json(getSitemap(tournaments, translations));
}

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale: `${locale}.json` }));
}
