import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { tournamentsUrl } from '@/libs/urls';
import {
  type TournamentAnnouncementProps,
  TournamentAnnouncementBanner,
} from '@/components/home/TournamentAnnouncementBanner';
import { TournamentGrid } from '@/components/home/TournamentGrid';
import { TournamentMedalistsCard } from '@/components/home/TournamentMedalistsCard';

export type TournamentCardsProps = {
  previewCount?: number;
  event: EventContext;
  results: (Tournament | TournamentAnnouncementProps)[];
  translations: Translations;
};

export function TournamentCards({ event, previewCount, results, translations }: TournamentCardsProps) {
  const t = getTranslator(translations);
  const announcements = results.filter((result): result is TournamentAnnouncementProps => 'announcement' in result);
  const tournaments = results.filter((result): result is Tournament => !('announcement' in result));

  return (
    <TournamentGrid
      statsHref={tournamentsUrl(event, translations.locale)}
      statsLabel={t('actions.showTournamentsStats')}
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
