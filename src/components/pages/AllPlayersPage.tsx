import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { AllPlayersStats } from '@/components/AllPlayersStats';
import { Content } from '@/components/ui/Content';
import { Title } from '@/components/ui/Title';

type AllPlayersPageProps = {
  event: EventContext;
  players: Record<string, PlayerStats>;
  translations: Translations;
};

export function AllPlayersPage({ event, players, translations }: AllPlayersPageProps) {
  const t = getTranslator(translations);

  return (
    <Content>
      <Title>{t('site.allTimeStatsTitle')}</Title>
      <AllPlayersStats event={event} players={players} locale={translations.locale} />
    </Content>
  );
}
