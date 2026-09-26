import type { EventContext } from '@/schema/event';
import { createPlayersSorter } from '@/libs/sort';
import { PlayerCell } from '@/components/ui/PlayerCell';
import type { PlayerDetails } from '@/components/ui/PlayerName';

export type PodiumCellProps = {
  event: EventContext;
  players?: readonly PlayerDetails[] | null;
  locale: string;
  isDescending?: boolean;
  showRank?: boolean;
  showCountry?: boolean;
  emptyPlaceholder?: string;
};

export function PodiumCell({
  event,
  players,
  locale,
  isDescending = false,
  showRank,
  showCountry = event.showCountry,
  emptyPlaceholder = '—',
}: PodiumCellProps) {
  if (!players || players.length === 0) {
    return emptyPlaceholder;
  }

  const sorter = createPlayersSorter(locale, isDescending);
  const sorted = players.toSorted(sorter);

  return (
    <div className="flex flex-col gap-1">
      {sorted.map((player) => (
        <PlayerCell
          key={player.id ?? player.name}
          event={event}
          player={player}
          locale={locale}
          showRank={showRank}
          showCountry={showCountry}
        />
      ))}
    </div>
  );
}
