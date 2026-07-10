'use client';

import { useMemo } from 'react';
import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { filterCountryStatsByCategory } from '@/libs/countryStats';
import { CountryAchievements } from '@/components/stats/CountryAchievements';
import { CountryEvents } from '@/components/stats/CountryEvents';
import { CountryOpponents } from '@/components/stats/CountryOpponents';
import { CountryPlayers } from '@/components/stats/CountryPlayers';
import { Loader } from '@/components/ui/Loader';
import { useCountryStatsData } from '@/hooks/useCountryStatsData';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type CountryStatsProps = {
  event: EventContext;
  code: string;
  locale: Locale;
  category?: string;
};

type CountryStatsContentProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
  category?: string;
};

export function CountryStats({ event, code, locale, category }: CountryStatsProps) {
  const { data: translations } = useTranslationsData(event, locale);
  const { data: country } = useCountryStatsData(event, code);

  if (!translations || !country) {
    return <Loader />;
  }

  return <CountryStatsContent event={event} country={country} translations={translations} category={category} />;
}

function CountryStatsContent({ event, country, translations, category }: CountryStatsContentProps) {
  const filteredCountry = useMemo(
    () => (category ? filterCountryStatsByCategory(country, category) : country),
    [country, category]
  );

  return (
    <div className="flex flex-col gap-2">
      <CountryAchievements event={event} country={filteredCountry} translations={translations} />
      <CountryEvents event={event} country={filteredCountry} translations={translations} showCategories={!category} />
      <CountryPlayers event={event} country={filteredCountry} translations={translations} />
      <CountryOpponents event={event} country={filteredCountry} translations={translations} />
    </div>
  );
}
