'use client';

import { useCountryStatsData } from '@/hooks/useCountryStatsData';
import { useTranslationsData } from '@/hooks/useTranslationsData';
import type { StatsCountry } from '@/schema/data';
import type { Locale, Translations } from '@/i18n/consts';
import { CountryAchievements } from '@/components/stats/CountryAchievements';
import { CountryEvents } from '@/components/stats/CountryEvents';
import { CountryOpponents } from '@/components/stats/CountryOpponents';
import { CountryPlayers } from '@/components/stats/CountryPlayers';
import { Loader } from '@/components/ui/Loader';

type CountryStatsProps = {
  code: string;
  locale: Locale;
};

type CountryStatsContentProps = {
  country: StatsCountry;
  translations: Translations;
};

export function CountryStats({ code, locale }: CountryStatsProps) {
  const { data: translations } = useTranslationsData(locale);
  const { data: country } = useCountryStatsData(code);

  if (!translations || !country) {
    return <Loader />;
  }

  return <CountryStatsContent country={country} translations={translations} />;
}

function CountryStatsContent({ country, translations }: CountryStatsContentProps) {
  return (
    <div className="flex flex-col gap-2">
      <CountryAchievements country={country} translations={translations} />
      <CountryPlayers country={country} translations={translations} />
      <CountryEvents country={country} translations={translations} />
      <CountryOpponents country={country} translations={translations} />
    </div>
  );
}
