import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { CategoryTournamentCards } from '@/components/home/CategoryTournamentCards';
import { TournamentCards } from '@/components/home/TournamentCards';

export type TournamentsProps = {
  event: EventContext;
  tournaments: Tournament[];
  translations: Translations;
};

const PREVIEW_COUNT = 5;
const EXPAND_THRESHOLD = 9;

export function Tournaments({ event, tournaments, translations }: TournamentsProps) {
  const previewCount = getPreviewCount(tournaments);

  return event.categories?.length ? (
    <CategoryTournamentCards
      event={event}
      tournaments={tournaments}
      translations={translations}
      previewCount={previewCount}
    />
  ) : (
    <TournamentCards event={event} results={tournaments} translations={translations} previewCount={previewCount} />
  );
}

function getPreviewCount(results: Tournament[]) {
  const tournamentCount = results.filter((result) => !('announcement' in result) || !result.announcement).length;

  return tournamentCount > EXPAND_THRESHOLD ? PREVIEW_COUNT : undefined;
}
