import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerDetails, PlayerName } from '@/components/ui/PlayerName';

export type PlayerCellProps = {
  player: PlayerDetails;
  locale: string;
  showRank?: boolean;
  showCountry?: boolean;
};

export function PlayerCell({ player, locale, showRank, showCountry }: PlayerCellProps) {
  return (
    <div className="text-left">
      <PlayerLink playerId={player.id} locale={locale}>
        <PlayerName player={player} showRank={showRank} showCountry={showCountry} />
      </PlayerLink>
    </div>
  );
}
