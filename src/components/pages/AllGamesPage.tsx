import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllGames } from '@/components/stats/AllGames';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type AllGamesPageProps = {
  event: EventContext;
  translations: Translations;
};

export function AllGamesPage({ event, translations }: AllGamesPageProps) {
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.gamesListTitle')}</Title>
      <AllGames event={event} locale={translations.locale} />
    </Content>
  );
}
