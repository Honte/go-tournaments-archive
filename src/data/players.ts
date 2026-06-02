import slugify from 'slugify';
import type { Player } from '@/schema/data';
import { normalizeRank } from '@/libs/rank';

const PLAYER_REGEX =
  /^(?<name>[\p{Letter} -]+)(\s+(?<rank>[0-9]{1,2}[dkpDKP])?)?(\s+\((?<country>[A-Z]{2})\))?(\s+\|(?<egd>[0-9]+))?$/u;

export type PlayersHandler = ReturnType<typeof createPlayersHandler>;

export type PlayerData = {
  id: string;
  egd?: number;
  lastUsedName: string;
  names: Set<string>;
  hashes: Set<string>;
};

export function parsePlayers(json: Record<string, string>): Record<string, Player> {
  return createPlayersHandler().loadJson(json);
}

export function createPlayersHandler() {
  const playersById = new Map<string, PlayerData>();
  const playersByHash = new Map<string, PlayerData[]>();
  const playersByEgd = new Map<number, PlayerData>();

  return {
    loadJson,
    loadPlayer,
    findPlayer,
    getPlayer,
    getPlayers,
  };

  function getPlayer(id: string) {
    return playersById.get(id);
  }

  function getPlayers() {
    return Array.from(playersById.values());
  }

  function findPlayer(name: string, egd?: number) {
    if (egd && playersByEgd.has(egd)) {
      return playersByEgd.get(egd)!;
    }

    const hash = getPlayerHash(name);
    const candidates = playersByHash.get(hash);

    if (candidates?.length) {
      for (const candidate of candidates) {
        if (candidate.hashes.has(hash)) {
          return candidate;
        }
      }
    }

    return undefined;
  }

  function parsePlayerString(string: string) {
    const details = string.match(PLAYER_REGEX);

    if (!details) {
      throw new Error(`Could not parse player ${string}`);
    }

    const { name, rank, country, egd } = details.groups!;

    return {
      name,
      rank: normalizeRank(rank),
      country,
      egd: egd ? Number(egd) : undefined,
    };
  }

  function getPlayerId(name: string, egd?: number): string {
    const hash = getPlayerHash(name);
    const player = findPlayer(name, egd);

    // don't reuse player if it has different EGD pin
    if (player && (!player.egd || !egd || player.egd === egd)) {
      player.lastUsedName = name;
      player.names.add(name);
      player.hashes.add(hash);

      if (!player.egd && egd) {
        player.egd = egd;
        playersByEgd.set(egd, player);
      }

      return player.id;
    }

    const base = getPlayerSlug(hash);
    let id = base;
    let index = 1;

    while (playersById.has(id) && !playersById.get(id)!.hashes.has(hash)) {
      id = `${base}${++index}`;
    }

    const playerData = {
      id,
      egd,
      lastUsedName: name,
      names: new Set([name]),
      hashes: new Set([hash]),
    };

    playersById.set(id, playerData);
    playersByHash.set(hash, [...(playersByHash.get(hash) ?? []), playerData]);
    if (egd) {
      playersByEgd.set(egd, playerData);
    }

    return id;
  }

  function loadPlayer(player: Omit<Player, 'id'> | string): Player {
    if (typeof player === 'string') {
      return loadPlayer(parsePlayerString(player));
    }

    return {
      ...player,
      id: getPlayerId(player.name, player.egd),
    };
  }

  function loadJson(json?: Record<string, string>): Record<string, Player> {
    const players: Record<string, Player> = {};

    if (!json) {
      return players;
    }

    for (const id in json) {
      const player = parsePlayerString(json[id]);

      players[id] = {
        ...player,
        id: getPlayerId(player.name, player.egd),
      };
    }

    return players;
  }
}

export function getPlayerHash(name: string) {
  return name
    .toLowerCase()
    .split(' ')
    .map((name) => slugify(name))
    .join(' ');
}

export function getPlayerSlug(hash: string) {
  const parts = hash.split(' ');

  return (
    parts
      .slice(0, -1)
      .map((part) => part[0])
      .join('') + parts.at(-1)
  );
}
