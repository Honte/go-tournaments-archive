import type { ReactNode } from 'react';
import type { CountryStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Details } from '@/components/Details';
import { AchievementYears } from '@/components/stats/AchievementYears';
import { H2 } from '@/components/ui/H2';

type CountryAchievementsProps = {
  event: EventContext;
  country: CountryStats;
  translations: Translations;
};

const MEDALS = ['first', 'second', 'third'] as const;

export function CountryAchievements({ event, country, translations }: CountryAchievementsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  let hasMedals = false;
  for (const [index, medal] of MEDALS.entries()) {
    if (event.categories?.length) {
      for (const category of event.categories) {
        const achievements = country.categoriesMedals[category]?.[index];

        if (achievements?.length) {
          details[t(`winners.${medal}In`, t(`categories.short.${category}`))] = (
            <AchievementYears event={event} years={achievements} locale={translations.locale} />
          );
          hasMedals = true;
        }
      }
    } else {
      const achievements = country.medals[index];

      if (achievements.length) {
        details[t(`winners.${medal}`)] = (
          <AchievementYears event={event} years={achievements} locale={translations.locale} />
        );
        hasMedals = true;
      }
    }
  }

  if (event.showBestPlace && !hasMedals) {
    details[t('table.bestPlace')] = country.bestPlace;
  }

  details[t('table.events')] = Object.keys(country.years).length;
  details[t('table.games')] = country.totalGames;
  details[t('table.won')] = country.totalWon;

  return (
    <div className="my-1 flex flex-col">
      <H2>{t('stats.achievements')}</H2>
      <Details details={details} />
    </div>
  );
}
