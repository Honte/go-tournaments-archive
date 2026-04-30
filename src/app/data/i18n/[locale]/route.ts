import { notFound } from 'next/navigation';
import type { Locale } from '@/i18n/consts';
import { EVENT_LOCALES, isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export const dynamic = 'force-static';

export async function GET(_: Request, props: PageProps) {
  const { locale: localeParam } = await props.params;
  const check = localeParam.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;

  if (!isEventLocale(locale)) {
    return notFound();
  }

  return Response.json(await loadTranslations(locale));
}

export function generateStaticParams() {
  return EVENT_LOCALES.map((locale) => ({ locale: `${locale}.json` }));
}
