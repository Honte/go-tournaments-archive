'use client';

import type { CountryStats } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import { CountryAchievements } from '@/components/stats/CountryAchievements';
import { CountryEvents } from '@/components/stats/CountryEvents';
import { CountryOpponents } from '@/components/stats/CountryOpponents';
import { CountryPlayers } from '@/components/stats/CountryPlayers';
import { Loader } from '@/components/ui/Loader';
import { useCountryStatsData } from '@/hooks/useCountryStatsData';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type CountryStatsProps = {
  code: string;
  locale: Locale;
  showBestPlace?: boolean;
};

type CountryStatsContentProps = {
  country: CountryStats;
  translations: Translations;
  showBestPlace?: boolean;
};

export function CountryStats({ code, locale, showBestPlace }: CountryStatsProps) {
  const { data: translations } = useTranslationsData(locale);
  const { data: country } = useCountryStatsData(code);

  if (!translations || !country) {
    return <Loader />;
  }

  return <CountryStatsContent country={country} translations={translations} showBestPlace={showBestPlace} />;
}

function CountryStatsContent({ country, translations, showBestPlace }: CountryStatsContentProps) {
  return (
    <div className="flex flex-col gap-2">
      <CountryAchievements country={country} translations={translations} showBestPlace={showBestPlace} />
      <CountryPlayers country={country} translations={translations} showBestPlace={showBestPlace} />
      <CountryEvents country={country} translations={translations} />
      <CountryOpponents country={country} translations={translations} />
    </div>
  );
}
