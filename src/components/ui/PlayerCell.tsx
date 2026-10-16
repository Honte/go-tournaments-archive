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
  showMembersRank?: boolean;
  showCountry?: boolean;
};

export function PlayerCell({
  event,
  player,
  locale,
  showLink = true,
  showRank = true,
  showMembersRank = false,
  showCountry = event.showCountry,
}: PlayerCellProps) {
  if (player.members) {
    const showMemberCountries = showCountry && player.members[0].country !== player.members[1].country;
    return (
      <div>
        {player.members.map((member, index) => (
          <Fragment key={member.id}>
            {index > 0 && ' +\u00a0'}
            <PlayerCell
              event={event}
              player={member}
              locale={locale}
              showRank={showMembersRank}
              showCountry={showMemberCountries}
            />
          </Fragment>
        ))}
        {getRankCountrySuffix(showRank && player.rank, showCountry && !showMemberCountries && player.country)}
      </div>
    );
  }

  return (
    <PlayerLink event={event} playerId={showLink ? player.id : undefined} locale={locale}>
      <PlayerName player={player} showRank={showRank} showCountry={showCountry} />
    </PlayerLink>
  );
}
