'use client';

import { useMemo } from 'react';
import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { filterPlayerStatsByCategory } from '@/libs/playerStats';
import { Opponents } from '@/components/stats/Opponents';
import { PlayerGames } from '@/components/stats/PlayerGames';
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
  return (
    <div className="flex max-xl:flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4">
        <PlayerEvents event={event} player={player} translations={translations} showCategories={!category} />
        <PlayerGames event={event} player={player} translations={translations} />
      </div>
      <Opponents event={event} player={player} translations={translations} />
    </div>
  );
}
