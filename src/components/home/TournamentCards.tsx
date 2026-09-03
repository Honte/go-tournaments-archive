import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { TournamentAnnouncementBanner } from '@/components/home/TournamentAnnouncementBanner';
import { TournamentGrid } from '@/components/home/TournamentGrid';
import { TournamentMedalistsCard } from '@/components/home/TournamentMedalistsCard';
import type { Result, Announcement } from './types';

export type TournamentCardsProps = {
  previewCount?: number;
  event: EventContext;
  results: (Result | Announcement)[];
  translations: Translations;
};

export function TournamentCards({ event, previewCount, results, translations }: TournamentCardsProps) {
  const t = getTranslator(translations);
  const announcements = results.filter((result): result is Announcement => 'announcement' in result);
  const tournaments = results.filter((result): result is Result => !('announcement' in result));

  return (
    <TournamentGrid
      announcements={announcements.map((announcement) => (
        <TournamentAnnouncementBanner
          key={announcement.year}
          event={event}
          tournament={announcement}
          translations={translations}
        />
      ))}
      items={tournaments.map((result) => (
        <TournamentMedalistsCard key={result.year} event={event} result={result} translations={translations} />
      ))}
      previewCount={previewCount}
      moreLabel={
        previewCount === undefined ? '' : t('winners.showMoreTournaments', String(tournaments.length - previewCount))
      }
      lessLabel={t('actions.showLess')}
    />
  );
}
