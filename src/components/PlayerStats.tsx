'use client';

import type { ApiPlayerStats } from '@/schema/api';
import type { Locale, Translations } from '@/i18n/consts';
import { Opponents } from '@/components/stats/Opponents';
import { PlayerGames } from '@/components/stats/PlayerGames';
import { Loader } from '@/components/ui/Loader';
import { usePlayerStatsData } from '@/hooks/usePlayerStatsData';
import { useTranslationsData } from '@/hooks/useTranslationsData';
import { PlayerEvents } from './stats/PlayerEvents';

type PlayerStatsProps = {
  slug: string;
  locale: Locale;
  showCountry?: boolean;
};

type PlayerStatsContentProps = {
  player: ApiPlayerStats;
  translations: Translations;
  showCountry?: boolean;
};

export function PlayerStats({ slug, locale, showCountry }: PlayerStatsProps) {
  const { data: translations } = useTranslationsData(locale);
  const { data: player } = usePlayerStatsData(slug);

  if (!translations || !player) {
    return <Loader />;
  }

  return <PlayerStatsContent player={player} translations={translations} showCountry={showCountry} />;
}

function PlayerStatsContent({ player, translations, showCountry }: PlayerStatsContentProps) {
  return (
    <div className="flex max-xl:flex-col gap-4">
      <div className="flex flex-1 flex-col gap-4">
        <PlayerEvents player={player} translations={translations} showCountry={showCountry} />
        <PlayerGames player={player} translations={translations} showCountry={showCountry} />
      </div>
      <Opponents player={player} translations={translations} />
    </div>
  );
}
