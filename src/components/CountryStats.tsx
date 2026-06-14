'use client';

import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
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
};

type CountryStatsContentProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
};

export function CountryStats({ event, code, locale }: CountryStatsProps) {
  const { data: translations } = useTranslationsData(event, locale);
  const { data: country } = useCountryStatsData(event, code);

  if (!translations || !country) {
    return <Loader />;
  }

  return <CountryStatsContent event={event} country={country} translations={translations} />;
}

function CountryStatsContent({ event, country, translations }: CountryStatsContentProps) {
  return (
    <div className="flex flex-col gap-2">
      <CountryAchievements event={event} country={country} translations={translations} />
      <CountryPlayers event={event} country={country} translations={translations} />
      <CountryEvents event={event} country={country} translations={translations} />
      <CountryOpponents event={event} country={country} translations={translations} />
    </div>
  );
}
