import type { Game, Player, ScoringBreaker, TableResult } from '@/schema/data';
import { Breaker } from '@/schema/data';
import { getRankValue } from '@/data/rank';

export function createTable({
  gamesMap,
  playersMap,
  rounds,
  order,
  breakers,
}: {
  gamesMap: Record<string, Game>;
  playersMap: Record<string, Player>;
  rounds: string[][];
  order?: string[];
  breakers?: Breaker[];
}): TableResult[] {
  const map: Record<string, TableResult> = {
    BYE: {
      id: 'BYE',
      place: 0,
      score: 0,
      index: 0,
      wins: 0,
      sos: 0,
      sodos: 0,
      sosos: 0,
      mms: 0,
      starting: 0,
      games: new Array(rounds.length).fill(null),
      won: [],
      lost: [],
      rank: 0,
    },
  };
  const players: TableResult[] = [];

  let position = 1;
  for (const id in playersMap) {
    const player: TableResult = {
      id,
      place: 1,
      score: 0,
      index: 0,
      wins: 0,
      sos: 0,
      sodos: 0,
      sosos: 0,
      mms: 0,
      starting: position++,
      games: new Array(rounds.length).fill(null),
      won: [],
      lost: [],
      rank: getRankValue(playersMap[id].rank),
    };

    map[id] = player;
    players.push(player);
  }

  // collect wins & games
  for (const [index, round] of rounds.entries()) {
    for (const game of round) {
      const {
        players: [a, b],
        result,
      } = gamesMap[game];

      const winner = a.won ? a.id : b.id;
      const loser = a.won ? b.id : a.id;

      map[winner].wins += 1;
      map[winner].won.push(loser);
      map[loser].lost.push(winner);
      map[winner].games[index] = {
        opponent: loser,
        index: 0,
        won: true,
        result,
        game,
      };
      map[loser].games[index] = {
        opponent: winner,
        index: 0,
        won: false,
        result,
        game,
      };
    }
  }

  // calculate sos & sodos
  for (const id in map) {
    const player = map[id];

    for (const won of player.won) {
      player.sos += map[won].wins;
      player.sodos += map[won].wins;
    }

    for (const lost of player.lost) {
      player.sos += map[lost].wins;
    }
  }

  // calculate sosos
  for (const id in map) {
    const player = map[id];

    for (const won of player.won) {
      player.sosos += map[won].sos;
    }

    for (const lost of player.lost) {
      player.sosos += map[lost].sos;
    }
  }

  const table = order ? sortByOrder(players, order) : sortByBreakers(players, breakers!);

  // assign player index
  for (const player of table) {
    for (const game of player.games) {
      if (game?.opponent) {
        game.index = map[game.opponent].index;
      }
    }
  }

  return table;
}

function sortByOrder(players: TableResult[], order: string[]): TableResult[] {
  const result: TableResult[] = [];
  const map = players.reduce((m, p) => m.set(p.id, p), new Map<string, TableResult>());

  // place players based on order
  for (const [place, placed] of order.entries()) {
    for (const id of placed.split(',')) {
      const player = map.get(id.trim());

      if (player) {
        player.place = place + 1;
        player.index = result.push(player);
        map.delete(player.id);
      }
    }
  }

  // if any player was not mapped, add them at the end with the same place
  for (const player of map.values()) {
    player.place = order.length;
    player.index = result.push(player);
  }

  return players;
}

function sortByBreakers(players: TableResult[], breakers: Breaker[]): TableResult[] {
  const final = breakers.reduce(
    (groups, breaker) => {
      const nextGroups: TableResult[][] = [];
      const picker = (p: TableResult) => p[breaker as ScoringBreaker];

      for (const group of groups) {
        if (group.length === 1) {
          nextGroups.push(group);
          continue;
        }

        if (breaker === Breaker.DIRECT_MATCH) {
          for (const next of getDirectMatchesGroups(group)) {
            nextGroups.push(next);
          }
          continue;
        }

        const entries = getGroupedEntries(group, picker);

        if (breaker === Breaker.STARTING_POSITION) {
          entries.reverse();
        }

        for (const [, players] of entries) {
          nextGroups.push(players);
        }
      }

      return nextGroups;
    },
    [players]
  );

  const result: TableResult[] = [];
  for (const [index, group] of final.entries()) {
    for (const player of group) {
      player.place = index + 1;
      player.index = result.push(player);
    }
  }

  return result;
}

function getGroupedEntries(list: TableResult[], propPicker: (p: TableResult) => number): [string, TableResult[]][] {
  const grouped = list.reduce<Record<string, TableResult[]>>((map, player) => {
    (map[propPicker(player)] ||= []).push(player);
    return map;
  }, {});

  return Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a));
}

function* getDirectMatchesGroups(group: TableResult[]): Generator<TableResult[]> {
  if (group.length === 1) {
    yield group;
    return;
  }

  if (group.length === 2) {
    const [a, b] = group;

    if (a.won.includes(b.id)) {
      yield [a];
      yield [b];
      return;
    }

    if (b.won.includes(a.id)) {
      yield [b];
      yield [a];
      return;
    }

    yield group;
    return;
  }

  const directScores = group.reduce<Record<string, number>>((map, player) => {
    map[player.id] = group.reduce((r, p) => r + Number(player.won.includes(p.id)), 0);
    return map;
  }, {});

  const entries = getGroupedEntries(group, (p) => directScores[p.id]);

  if (entries.length === 1) {
    yield group;
    return;
  }

  for (const [, entry] of entries) {
    yield* getDirectMatchesGroups(entry);
  }
}
