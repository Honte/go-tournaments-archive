'use client';

import { useTranslationsData } from '@/hooks/useTranslationsData';
import type { StatsOpponent, StatsPlayer } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import { Events } from '@/components/stats/Events';
import { Opponents } from '@/components/stats/Opponents';
import { Loader } from '@/components/ui/Loader';

type PlayerStatsProps = {
  player: StatsPlayer;
  opponents: StatsOpponent[];
  locale: Locale;
};

type PlayerStatsContentProps = {
  player: StatsPlayer;
  opponents: StatsOpponent[];
  translations: Translations;
};

export function PlayerStats({ player, opponents, locale }: PlayerStatsProps) {
  const { data: translations } = useTranslationsData(locale);

  if (!translations) {
    return <Loader />;
  }

  return <PlayerStatsContent player={player} opponents={opponents} translations={translations} />;
}

function PlayerStatsContent({ player, opponents, translations }: PlayerStatsContentProps) {
  return (
    <div className="flex max-xl:flex-col gap-4">
      <Events player={player} translations={translations} />
      <Opponents opponents={opponents} translations={translations} />
    </div>
  );
}
