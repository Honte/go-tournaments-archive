import type { Metadata } from 'next';
import type { Locale } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import { AllGames } from '@/components/stats/AllGames';
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
    title: `${t('site.gamesListTitle')} - ${t('site.name')}`,
    description: t('site.gamesListDescription'),
  };
}

export default async function AllGamesPage({ params }: PageProps) {
  const { locale } = await params;

  const translations = await loadTranslations(locale);
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.gamesListTitle')}</Title>
      <AllGames locale={translations.locale} />
    </Content>
  );
}
