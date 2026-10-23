'use client';

import { useMemo } from 'react';
import type { PlayerResult, PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { isPair } from '@/libs/participants';
import { filterPlayerStatsByCategory } from '@/libs/playerStats';
import { Opponents } from '@/components/stats/Opponents';
import { Partners } from '@/components/stats/Partners';
import { Loader } from '@/components/ui/Loader';
import { usePlayerStatsData } from '@/hooks/usePlayerStatsData';
import { useTranslationsData } from '@/hooks/useTranslationsData';
import { PlayerEvents } from './stats/PlayerEvents';

type PlayerStatsProps = {
  event: EventContext;
  slug: string;
  locale: Locale;
  category?: string;
};

type PlayerStatsContentProps = {
  event: EventContext;
  player: PlayerStats;
  translations: Translations;
  category?: string;
};

export function PlayerStats({ event, slug, locale, category }: PlayerStatsProps) {
  const { data: translations } = useTranslationsData(event, locale);
  const { data: player } = usePlayerStatsData(event, slug);
  const statsPlayer = useMemo(
    () => (player && category ? filterPlayerStatsByCategory(player, category) : player),
    [player, category]
  );

  if (!translations || !statsPlayer) {
    return <Loader />;
  }

  return <PlayerStatsContent event={event} player={statsPlayer} translations={translations} category={category} />;
}

function PlayerStatsContent({ event, player, translations, category }: PlayerStatsContentProps) {
  const sections = getPlayerPairSections(player.results);
  const hasPartners = event.pairs && sections.hasPartners;
  const hasOpposingPairs = event.pairs && sections.hasOpposingPairs;

  return (
    <div className="flex flex-col gap-6">
      <PlayerEvents event={event} player={player} translations={translations} />
      {hasPartners && <Partners event={event} player={player} translations={translations} category={category} />}
      <div className={`grid grid-cols-1 gap-6 ${hasOpposingPairs ? 'xl:grid-cols-2' : ''}`}>
        <Opponents event={event} player={player} translations={translations} category={category} />
        {hasOpposingPairs && (
          <Opponents event={event} player={player} translations={translations} category={category} pairs />
        )}
      </div>
    </div>
  );
}

function getPlayerPairSections(results: PlayerResult[]) {
  let hasPartners = false;
  let hasOpposingPairs = false;

  for (const result of results) {
    hasPartners ||= Boolean(result.partner);

    for (const stage of result.stages) {
      for (const game of stage.games) {
        if (game.id !== 'BYE' && game.opponent && isPair(game.opponent)) {
          hasOpposingPairs = true;
        }
      }
    }
  }

  return { hasPartners, hasOpposingPairs };
}
