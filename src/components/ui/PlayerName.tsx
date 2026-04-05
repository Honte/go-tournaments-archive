import EVENT_CONFIG from '@event/config';

export type PlayerDetails = {
  id: string;
  name?: string;
  rank?: string;
  country?: string;
  countries?: Iterable<string>;
};

export type PlayerNameProps = {
  player: PlayerDetails;
  includeRank?: boolean;
  includeCountry?: boolean;
};

export function PlayerName({ player, includeRank = true, includeCountry = EVENT_CONFIG.showCountry }: PlayerNameProps) {
  const { name, rank } = player;

  if (includeCountry) {
    const country = getCountry(player);

    if (country && includeRank && rank) {
      return `${name}, ${rank} (${country})`;
    }

    if (country) {
      return `${name} (${country})`;
    }
  }

  return includeRank && rank ? `${name} (${rank})` : player.name;
}

function getCountry(player: PlayerDetails) {
  if (player.countries) {
    return Array.from(new Set(player.countries)).join(', ');
  }

  if (player.country) {
    return player.country;
  }

  return undefined;
}
