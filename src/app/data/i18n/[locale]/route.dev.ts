import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function GET(_: Request, props: PageProps) {
  const { locale: localeParam } = await props.params;
  const check = localeParam.match(/^([a-z]{2})\.json$/);
  const locale = check?.[1] as Locale | undefined;
  const event = await loadDefaultEvent();

  if (!isEventLocale(event, locale)) {
    return notFound();
  }

  return Response.json(await loadTranslations(event, locale));
}
