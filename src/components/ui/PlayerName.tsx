import { getRankCountrySuffix } from '@/libs/labels';

export type PlayerDetails = {
  id: string;
  members?: readonly PlayerDetails[];
  name?: string;
  rank?: string;
  country?: string | Iterable<string>;
};

export type PlayerNameProps = {
  player: Omit<PlayerDetails, 'id'>;
  showRank?: boolean;
  showCountry?: boolean;
};

export function PlayerName({ player, showRank = true, showCountry = false }: PlayerNameProps) {
  const name = player.members ? player.members.map((member) => member.name).join(' + ') : player.name;

  return name + getRankCountrySuffix(showRank && player.rank, showCountry && player.country);
}
