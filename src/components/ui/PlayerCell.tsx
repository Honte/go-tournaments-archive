import type { EventContext } from '@/schema/event';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerDetails, PlayerName } from '@/components/ui/PlayerName';

export type PlayerCellProps = {
  event: EventContext;
  player: PlayerDetails;
  locale: string;
  showRank?: boolean;
  showCountry?: boolean;
};

export function PlayerCell({ event, player, locale, showRank, showCountry = event.showCountry }: PlayerCellProps) {
  return (
    <div className="text-left">
      <PlayerLink event={event} playerId={player.id} locale={locale}>
        <PlayerName player={player} showRank={showRank} showCountry={showCountry} />
      </PlayerLink>
    </div>
  );
}
