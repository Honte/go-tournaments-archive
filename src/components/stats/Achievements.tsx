import EVENT_CONFIG from '@event/config';
import type { StatsPlayer } from '@/schema/data';
import type { ReactNode } from 'react';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { Details } from '@/components/Details';
import { YearLink } from '@/components/YearLink';
import { H2 } from '@/components/ui/H2';

type AchievementsProps = {
  player: StatsPlayer;
  translations: Translations;
};

const MEDALS = ['first', 'second', 'third'] as const;

export function Achievements({ player, translations }: AchievementsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  let hasMedals = false;
  for (const [index, medal] of MEDALS.entries()) {
    if (EVENT_CONFIG.categories?.length) {
      for (const category of EVENT_CONFIG.categories) {
        const achievements = player.categoriesMedals[category][index];

        if (achievements.length) {
          details[t(`winners.${medal}In`, t(`categories.short.${category}`))] = (
            <AchievementYears years={achievements} locale={translations.locale} />
          );
          hasMedals = true;
        }
      }
    } else {
      const achievements = player.medals[index];

      if (achievements.length) {
        details[t(`winners.${medal}`)] = <AchievementYears years={achievements} locale={translations.locale} />;
        hasMedals = true;
      }
    }
  }

  if (EVENT_CONFIG.showBestPlace && !hasMedals) {
    details[t('table.bestPlace')] = player.bestPlace;
  }

  details[t('table.events')] = player.years.length;
  details[t('table.games')] = player.totalGames;
  details[t('table.won')] = player.totalWon;

  return (
    <div className="my-1 flex flex-col">
      <H2>{t('stats.achievements')}</H2>
      <Details details={details} />
    </div>
  );
}

function AchievementYears(props: { years: string[]; locale: string }) {
  return (
    <span className="text-wrap">
      {listYear(props.years.toReversed(), props.locale)} ({props.years.length})
    </span>
  );
}

function listYear(years: string[], locale: string) {
  return jsxJoin(
    years.map((year) => <YearLink key={year} locale={locale} year={year} />),
    ', '
  );
}
