import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerDetails, PlayerName } from '@/components/ui/PlayerName';

export type PlayerCellProps = {
  player: PlayerDetails;
  locale: string;
  includeRank?: boolean;
  includeCountry?: boolean;
};

export function PlayerCell({ player, locale, includeRank, includeCountry }: PlayerCellProps) {
  return (
    <div className="text-left">
      <PlayerLink playerId={player.id} locale={locale}>
        <PlayerName player={player} showRank={includeRank} showCountry={includeCountry} />
      </PlayerLink>
    </div>
  );
}
