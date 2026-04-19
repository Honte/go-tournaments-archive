import { getAllPlayersStats } from '@/data';
import type { Metadata } from 'next';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
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
  const players = await getAllPlayersStats();
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.allTimeStatsTitle')}</Title>
      <AllPlayersStats players={players} translations={translations} />
    </Content>
  );
}
