import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getTranslations } from '@/data/serverApi';
import { AllGames } from '@/components/stats/AllGames';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type AllGamesPageProps = {
  event: EventContext;
  locale: Locale;
};

export async function AllGamesPage({ event, locale }: AllGamesPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.gamesListTitle')}</Title>
      <AllGames event={event} locale={locale} />
    </Content>
  );
}

export async function getAllGamesMetadata({ event, locale }: AllGamesPageProps) {
  const translations = await getTranslations(event, locale);
  const t = getTranslator(translations);

  return {
    title: `${t('site.gamesListTitle')} - ${t('site.name')}`,
    description: t('site.gamesListDescription'),
  };
}

export async function getAllGamesPageOptions(event: EventContext) {
  return event.locales.map((locale) => ({ locale }));
}
