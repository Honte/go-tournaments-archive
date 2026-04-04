import { getStats } from '@/data';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { PlayerStats } from '@/components/PlayerStats';

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.allTimeStatsTitle')} - ${t('site.name')}`,
    description: t('site.allTimeStatsDescription'),
  };
}

export default async function Stats({ params }: PageProps) {
  const { locale } = await params;

  const translations = await loadTranslations(locale);
  const stats = await getStats();
  const t = getTranslator(translations);

  return (
    <>
      <h1 className="text-4xl text-center font-bold mb-4">{t('stats.allTimeHeader')}</h1>
      <PlayerStats players={stats.players} translations={translations} />
    </>
  );
}
