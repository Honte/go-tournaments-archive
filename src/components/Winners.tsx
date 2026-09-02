import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { CategoryWinnersTable, WinnersTable, type WinnersTableProps } from '@/components/WinnersTable';

export type WinnersProps = {
  event: EventContext;
  tournaments: Tournament[];
  translations: Translations;
};

const PREVIEW_COUNT = 5;
const EXPAND_THRESHOLD = 9;

export function Winners({ event, tournaments, translations }: WinnersProps) {
  return event.categories?.length ? (
    <CategoryWinnersTable
      event={event}
      tournaments={tournaments}
      translations={translations}
      previewCount={getPreviewCount(tournaments)}
    />
  ) : (
    <ExpandableWinners event={event} results={tournaments} translations={translations} />
  );
}

function ExpandableWinners({ event, results, translations }: WinnersTableProps) {
  return (
    <WinnersTable event={event} results={results} translations={translations} previewCount={getPreviewCount(results)} />
  );
}

function getPreviewCount(results: (Tournament | WinnersTableProps['results'][number])[]) {
  const tournamentCount = results.filter((result) => !('announcement' in result) || !result.announcement).length;

  return tournamentCount > EXPAND_THRESHOLD ? PREVIEW_COUNT : undefined;
}
