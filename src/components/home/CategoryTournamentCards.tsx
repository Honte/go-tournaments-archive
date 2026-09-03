import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { CategoryTournamentMedalistsCard } from '@/components/home/CategoryTournamentMedalistsCard';
import { TournamentAnnouncementBanner } from '@/components/home/TournamentAnnouncementBanner';
import { TournamentGrid } from '@/components/home/TournamentGrid';

export type CategoryTournamentCardsProps = {
  previewCount?: number;
  event: EventContext;
  tournaments: Tournament[];
  translations: Translations;
};

export function CategoryTournamentCards({
  event,
  previewCount,
  tournaments,
  translations,
}: CategoryTournamentCardsProps) {
  const t = getTranslator(translations);
  const announcements = tournaments.filter((tournament) => tournament.announcement);
  const results = tournaments.filter((tournament) => !tournament.announcement);

  return (
    <TournamentGrid
      announcements={announcements.map((tournament) => (
        <TournamentAnnouncementBanner
          key={tournament.id}
          event={event}
          tournament={{
            announcement: tournament.announcement!,
            website: Array.isArray(tournament.website) ? tournament.website[0] : tournament.website,
            year: tournament.year,
          }}
          translations={translations}
        />
      ))}
      items={results.map((tournament) => (
        <CategoryTournamentMedalistsCard
          key={tournament.id}
          event={event}
          tournament={tournament}
          translations={translations}
        />
      ))}
      previewCount={previewCount}
      moreLabel={
        previewCount === undefined ? '' : t('winners.showMoreTournaments', String(results.length - previewCount))
      }
      lessLabel={t('actions.showLess')}
    />
  );
}
