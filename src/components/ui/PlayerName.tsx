export type PlayerDetails = {
  id: string;
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
  const { name, rank } = player;

  if (showCountry) {
    const country = getCountry(player);

    if (country && showRank && rank) {
      return `${name}, ${rank} (${country})`;
    }

    if (country) {
      return `${name} (${country})`;
    }
  }

  return showRank && rank ? `${name} (${rank})` : player.name;
}

function getCountry(player: { country?: string | Iterable<string> }) {
  if (typeof player.country === 'string') {
    return player.country;
  }

  if (player.country) {
    return Array.from(new Set(player.country)).join(', ');
  }

  return undefined;
}
