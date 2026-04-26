'use client';

import { usePlayerStatsData } from '@/hooks/usePlayerStatsData';
import { useTranslationsData } from '@/hooks/useTranslationsData';
import type { ApiPlayerStats } from '@/schema/api';
import type { Locale, Translations } from '@/i18n/consts';
import { Events } from '@/components/stats/Events';
import { Opponents } from '@/components/stats/Opponents';
import { PlayerGames } from '@/components/stats/PlayerGames';
import { Loader } from '@/components/ui/Loader';

type PlayerStatsProps = {
  slug: string;
  locale: Locale;
};

type PlayerStatsContentProps = {
  player: ApiPlayerStats;
  translations: Translations;
};

export function PlayerStats({ slug, locale }: PlayerStatsProps) {
  const { data: translations } = useTranslationsData(locale);
  const { data: player } = usePlayerStatsData(slug);

  if (!translations || !player) {
    return <Loader />;
  }

  return <PlayerStatsContent player={player} translations={translations} />;
}

function PlayerStatsContent({ player, translations }: PlayerStatsContentProps) {
  return (
    <div className="flex max-xl:flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4">
        <Events player={player} translations={translations} />
        <PlayerGames player={player} translations={translations} />
      </div>
      <Opponents player={player} translations={translations} />
    </div>
  );
}
