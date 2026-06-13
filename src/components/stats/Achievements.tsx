import type { ReactNode } from 'react';
import type { ApiPlayerStats } from '@/schema/api';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { Details } from '@/components/Details';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { H2 } from '@/components/ui/H2';
import { YearLink } from '@/components/YearLink';

type AchievementsProps = {
  player: ApiPlayerStats;
  translations: Translations;
  categories?: string[];
  showBestPlace?: boolean;
};

const MEDALS = ['first', 'second', 'third'] as const;

export function Achievements({ player, translations, categories, showBestPlace }: AchievementsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  let hasMedals = false;
  for (const [index, medal] of MEDALS.entries()) {
    if (categories?.length) {
      for (const category of categories) {
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

  if (showBestPlace && !hasMedals) {
    details[t('table.bestPlace')] = player.bestPlace;
  }

  details[t('table.events')] = player.results.length;
  details[t('table.games')] = player.totalGames;
  details[t('table.won')] = player.totalWon;

  if (player.egd) {
    details[t('details.egd')] = (
      <ExternalLink href={getEgdProfileLink(player.egd)} title={t('details.goToEGD')}>
        {player.egd}
      </ExternalLink>
    );
  }

  return (
    <div className="flex flex-col">
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

function getEgdProfileLink(pin: number) {
  return `https://europeangodatabase.eu/EGD/Player_Card.php?&key=${pin}`;
}
