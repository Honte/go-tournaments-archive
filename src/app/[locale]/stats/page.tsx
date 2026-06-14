import type { Metadata } from 'next';
import { loadDefaultEvent } from '@/events';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { getAllPlayersStats } from '@/data';
import { AllPlayersStats } from '@/components/AllPlayersStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

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
    title: `${t('site.allTimeStatsTitle')} - ${t('site.name')}`,
    description: t('site.allTimeStatsDescription'),
  };
}

export default async function Stats({ params }: PageProps) {
  const { locale } = await params;

  const event = await loadDefaultEvent();
  const translations = await loadTranslations(event, locale);
  const players = await getAllPlayersStats();
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.allTimeStatsTitle')}</Title>
      <AllPlayersStats event={event} players={players} locale={locale} />
    </Content>
  );
}
