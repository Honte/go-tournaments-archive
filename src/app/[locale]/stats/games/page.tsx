import type { Metadata } from 'next';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { AllGamesPage } from '@/components/pages/AllGamesPage';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.gamesListTitle')} - ${t('site.name')}`,
    description: t('site.gamesListDescription'),
  };
}

export default async function Page({ params }: PageProps) {
  const { locale } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);

  return <AllGamesPage event={event} translations={translations} />;
}
