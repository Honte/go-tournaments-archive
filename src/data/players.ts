import slugify from 'slugify';
import type { Player } from '@/schema/data';
import type { EventPlayer } from '@/data/eventPlayers';

const PLAYER_REGEX =
  /^(?<name>[\p{Letter} -]+)(\s+(?<rank>[0-9]{1,2}[dkpDKP])?)?(\s+\((?<country>[A-Z]{2})\))?(\s+\|(?<egd>[0-9]+))?$/u;

export type PlayersHandler = ReturnType<typeof createPlayersHandler>;

export type PlayerData = {
  id: string;
  egd?: number;
  country?: string;
  displayName?: string;
  originalName?: string;
  lastUsedName: string;
  nickname: Set<string>;
  names: Set<string>;
  hashes: Set<string>;
};

export function parsePlayers(json: Record<string, string>): Record<string, Player> {
  return createPlayersHandler().loadJson(json);
}

export function createPlayersHandler(eventPlayers: EventPlayer[] = []) {
  const playersById = new Map<string, PlayerData>();
  const playersByEgd = new Map<number, PlayerData>();
  const playersByHash = new Map<string, Set<PlayerData>>();

  for (const player of eventPlayers) {
    registerEventPlayer(player);
  }

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

    if (candidates?.size) {
      for (const candidate of candidates) {
        if (candidate.names.has(name)) {
          return candidate;
        }
      }
    }

    return undefined;
  }

  function getPlayerData(name: string, egd?: number): PlayerData {
    const player = findPlayer(name, egd);

    // don't reuse player if it has different EGD pin
    if (player && (!player.egd || !egd || player.egd === egd)) {
      player.lastUsedName = name;
      player.names.add(name);
      registerPlayerHash(player, name);

      if (!player.egd && egd) {
        player.egd = egd;
        playersByEgd.set(egd, player);
      }

      return player;
    }

    const hash = getPlayerHash(name);
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
      nickname: new Set<string>(),
      names: new Set([name]),
      hashes: new Set<string>(),
    };

    playersById.set(id, playerData);
    registerPlayerHash(playerData, name);

    if (egd) {
      playersByEgd.set(egd, playerData);
    }

    return playerData;
  }

  function loadPlayer(player: Omit<Player, 'id'> | string): Player {
    if (typeof player === 'string') {
      return loadPlayer(parsePlayerString(player));
    }

    const playerData = getPlayerData(player.name, player.egd);

    return {
      ...player,
      id: playerData.id,
      name: player.name ?? playerData.displayName ?? playerData.lastUsedName,
      country: player.country ?? playerData.country,
      egd: player.egd ?? playerData.egd,
      original: playerData.originalName,
      nickname: [...playerData.nickname],
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
        ...loadPlayer(player),
      };
    }

    return players;
  }

  function registerEventPlayer(player: EventPlayer): void {
    if (playersById.has(player.id)) {
      throw new Error(`Duplicate player id in players.yml: ${player.id}`);
    }

    const playerData: PlayerData = {
      id: player.id,
      egd: player.egd,
      lastUsedName: player.name,
      displayName: player.name,
      country: player.country,
      originalName: player.original,
      nickname: new Set(player.nickname),
      names: new Set<string>(),
      hashes: new Set<string>(),
    };

    playersById.set(player.id, playerData);
    playerData.names.add(player.name);
    registerPlayerHash(playerData, player.name);

    if (player.original) {
      playerData.names.add(player.original);
      registerPlayerHash(playerData, player.original);
    }

    for (const nickname of player.nickname) {
      registerPlayerHash(playerData, nickname);
    }

    if (player.egd) {
      playersByEgd.set(player.egd, playerData);
    }
  }

  function registerPlayerHash(player: PlayerData, string?: string, shouldHash = true): void {
    if (!string) {
      return;
    }

    const hash = shouldHash ? getPlayerHash(string) : string;
    let existing = playersByHash.get(hash);

    if (!existing) {
      existing = new Set<PlayerData>();
      playersByHash.set(hash, existing);
    }

    existing.add(player);
    player.hashes.add(hash);
  }
}

function parsePlayerString(string: string) {
  const details = string.match(PLAYER_REGEX);

  if (!details) {
    throw new Error(`Could not parse player ${string}`);
  }

  const { name, rank, country, egd } = details.groups!;

  return {
    name,
    rank: rank?.toLowerCase(),
    country,
    egd: egd ? Number(egd) : undefined,
  };
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
