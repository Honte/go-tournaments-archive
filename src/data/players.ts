import type { Player } from '@/schema/data';
import slugify from 'slugify';

const PLAYER_REGEX = /^(?<name>[\p{Letter} -]+)( (?<rank>[0-9]{1,2}[dkp])?)?$/u;

export function parsePlayers(json: Record<string, string>): Record<string, Player> {
  return createPlayersHandler()(json);
}

export function createPlayersHandler() {
  const playerIds = {};

  return fromJson;

  function fromJson(json: Record<string, string>): Record<string, Player> {
    const players = {};

    for (const id in json) {
      const details = json[id].match(PLAYER_REGEX);

      if (!details) {
        throw new Error(`Could not parse player ${json[id]}`);
      }

      players[id] = {
        id: getPlayerId(details.groups.name),
        name: details.groups.name,
        rank: details.groups.rank,
      };
    }

    return players;
  }

  function getPlayerId(name: string) {
    const parts = name
      .toLowerCase()
      .split(' ')
      .map((name) => slugify(name));

    const full = parts.join(' ');
    const hash = parts.at(0)[0] + parts.at(-1);

    let id = hash;
    let index = 1;

    while (playerIds[id] && playerIds[id] !== full) {
      id = `${hash}${++index}`;
    }

    playerIds[id] = full;
    return id;
  }
}
