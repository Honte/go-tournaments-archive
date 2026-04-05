import EVENT_CONFIG from '@event/config';
import type { Player } from '@/schema/data';
import slugify from 'slugify';

const PLAYER_REGEX =
  /^(?<name>[\p{Letter} \-]+)(\s+(?<rank>[0-9]{1,2}[dkp])?)?(\s+\((?<country>[A-Z]{2})\))?(\s+|(?<egd>[0-9]+))?$/u;

export type PlayersHandler = ReturnType<typeof createPlayersHandler>;

export function parsePlayers(json: Record<string, string>): Record<string, Player> {
  return createPlayersHandler().loadJson(json);
}

export function createPlayersHandler() {
  const playerIds: Record<string, string> = {};

  return {
    loadJson,
    loadPlayer,
    playerIds,
  };

  function loadJson(json?: Record<string, string>): Record<string, Player> {
    const players: Record<string, Player> = {};

    if (!json) {
      return players;
    }

    for (const id in json) {
      const details = json[id].match(PLAYER_REGEX);

      if (!details) {
        throw new Error(`Could not parse player ${json[id]}`);
      }

      const { name, rank, egd, country = EVENT_CONFIG.defaultCountry } = details.groups!;

      players[id] = {
        id: getPlayerId(name, playerIds),
        name,
        rank,
        country,
        egd: Number(egd) ?? undefined,
      };
    }

    return players;
  }

  function loadPlayer(player: Omit<Player, 'id'>): Player {
    return {
      ...player,
      id: getPlayerId(player.name, playerIds),
    };
  }
}

function getPlayerId(name: string, playerIds: Record<string, string>) {
  const parts = name
    .toLowerCase()
    .split(' ')
    .map((name) => slugify(name));

  const full = parts.join(' ');
  const hash =
    parts
      .slice(0, -1)
      .map((part) => part[0])
      .join('') + parts.at(-1);

  let id = hash;
  let index = 1;

  while (playerIds[id] && playerIds[id] !== full) {
    id = `${hash}${++index}`;
  }

  playerIds[id] = full;
  return id;
}
