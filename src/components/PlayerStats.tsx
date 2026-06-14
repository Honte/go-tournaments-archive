'use client';

import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
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
};

type PlayerStatsContentProps = {
  event: EventContext;
  player: PlayerStats;
  translations: Translations;
};

export function PlayerStats({ event, slug, locale }: PlayerStatsProps) {
  const { data: translations } = useTranslationsData(event, locale);
  const { data: player } = usePlayerStatsData(event, slug);

  if (!translations || !player) {
    return <Loader />;
  }

  return <PlayerStatsContent event={event} player={player} translations={translations} />;
}

function PlayerStatsContent({ event, player, translations }: PlayerStatsContentProps) {
  return (
    <div className="flex max-xl:flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4">
        <PlayerEvents event={event} player={player} translations={translations} />
        <PlayerGames event={event} player={player} translations={translations} />
      </div>
      <Opponents event={event} player={player} translations={translations} />
    </div>
  );
}
