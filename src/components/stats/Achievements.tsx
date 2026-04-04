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

  for (const [index, category] of MEDALS.entries()) {
    const achievements = player.medals[index];

    if (achievements.length) {
      details[t(`winners.${category}`)] = (
        <span className="text-wrap">
          {listYear(achievements.toReversed(), translations.locale)} ({achievements.length})
        </span>
      );
    }
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

function listYear(years: string[], locale: string) {
  return jsxJoin(
    years.map((year) => <YearLink key={year} locale={locale} year={year} />),
    ', '
  );
}
