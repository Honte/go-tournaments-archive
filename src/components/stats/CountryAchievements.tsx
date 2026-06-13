import type { ReactNode } from 'react';
import type { StatsCountry } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { Details } from '@/components/Details';
import { H2 } from '@/components/ui/H2';
import { YearLink } from '@/components/YearLink';

type CountryAchievementsProps = {
  country: StatsCountry;
  translations: Translations;
  showBestPlace?: boolean;
};

const MEDALS = ['first', 'second', 'third'] as const;

export function CountryAchievements({ country, translations, showBestPlace }: CountryAchievementsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  let hasMedals = false;
  for (const [index, category] of MEDALS.entries()) {
    const achievements = country.medals[index];

    if (achievements.length) {
      details[t(`winners.${category}`)] = (
        <span className="text-wrap">
          {listYear(achievements.toReversed(), translations.locale)} ({achievements.length})
        </span>
      );
      hasMedals = true;
    }
  }

  if (showBestPlace && !hasMedals) {
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

function listYear(years: string[], locale: string) {
  return jsxJoin(
    years.map((year, index) => <YearLink key={index} locale={locale} year={year} />),
    ', '
  );
}
