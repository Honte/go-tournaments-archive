import { Fragment } from 'react';
import type { EventContext } from '@/schema/event';
import { getRankCountrySuffix } from '@/libs/labels';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerDetails, PlayerName } from '@/components/ui/PlayerName';

export type PlayerCellProps = {
  event: EventContext;
  player: PlayerDetails;
  locale: string;
  showLink?: boolean;
  showRank?: boolean;
  showCountry?: boolean;
};

export function PlayerCell({
  event,
  player,
  locale,
  showLink = true,
  showRank = true,
  showCountry = event.showCountry,
}: PlayerCellProps) {
  if (player.members) {
    return (
      <div>
        {player.members.map((member, index) => (
          <Fragment key={member.id}>
            {index > 0 && ' +\u00a0'}
            <PlayerCell event={event} player={member} locale={locale} showRank={false} showCountry={false} />
          </Fragment>
        ))}
        {getRankCountrySuffix(showRank && player.rank, showCountry && player.country)}
      </div>
    );
  }

  return (
    <PlayerLink event={event} playerId={showLink ? player.id : undefined} locale={locale}>
      <PlayerName player={player} showRank={showRank} showCountry={showCountry} />
    </PlayerLink>
  );
}
