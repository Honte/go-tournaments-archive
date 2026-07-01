import type { ReactNode } from 'react';
import type { PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Details } from '@/components/Details';
import { AchievementYears } from '@/components/stats/AchievementYears';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { H2 } from '@/components/ui/H2';

type AchievementsProps = {
  event: EventContext;
  player: PlayerStats;
  translations: Translations;
};

const MEDALS = ['first', 'second', 'third'] as const;

export function Achievements({ event, player, translations }: AchievementsProps) {
  const t = getTranslator(translations);
  const details: Record<string, ReactNode> = {};

  if (player.original?.length) {
    details[t('details.original')] = player.original;
  }

  let hasMedals = false;
  for (const [index, medal] of MEDALS.entries()) {
    if (event.categories?.length) {
      for (const category of event.categories) {
        const achievements = player.categoriesMedals[category][index];

        if (achievements.length) {
          details[t(`winners.${medal}In`, t(`categories.short.${category}`))] = (
            <AchievementYears event={event} years={achievements} locale={translations.locale} />
          );
          hasMedals = true;
        }
      }
    } else {
      const achievements = player.medals[index];

      if (achievements.length) {
        details[t(`winners.${medal}`)] = (
          <AchievementYears event={event} years={achievements} locale={translations.locale} />
        );
        hasMedals = true;
      }
    }
  }

  if (event.showBestPlace && !hasMedals) {
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

  if (player.nickname?.length) {
    details[t('details.nickname')] = player.nickname.join(', ');
  }

  return (
    <div className="flex flex-col">
      <H2>{t('stats.achievements')}</H2>
      <Details details={details} />
    </div>
  );
}

function getEgdProfileLink(pin: number) {
  return `https://europeangodatabase.eu/EGD/Player_Card.php?&key=${pin}`;
}
