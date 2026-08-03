import type { Game, Player, TableResult } from '@/schema/data';
import { Breaker } from '@/schema/data';
import { getRankValue } from '@/libs/rank';

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
      index: 0,
      place: 0,
      breakers: {
        wins: 0,
        sos: 0,
        sodos: 0,
        sosos: 0,
        starting: 0,
        rank: 0,
      },
      games: Array.from({ length: rounds.length }, () => null),
      won: [],
      drawn: [],
      lost: [],
    },
  };
  const players: TableResult[] = [];

  let position = 1;
  for (const id in playersMap) {
    const player: TableResult = {
      id,
      place: 1,
      index: 0,
      breakers: {
        score: 0,
        wins: 0,
        sos: 0,
        sodos: 0,
        sosos: 0,
        mms: 0,
        rank: getRankValue(playersMap[id].rank),
        starting: position++,
      },
      games: Array.from({ length: rounds.length }, () => null),
      won: [],
      drawn: [],
      lost: [],
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
        draw,
      } = gamesMap[game];

      if (draw) {
        map[a.id].breakers.wins += 0.5;
        map[b.id].breakers.wins += 0.5;
        map[a.id].drawn.push(b.id);
        map[b.id].drawn.push(a.id);
        map[a.id].games[index] = {
          color: a.color,
          opponent: b.id,
          index: 0,
          won: false,
          drawn: true,
          result,
          game,
        };
        map[b.id].games[index] = {
          color: b.color,
          opponent: a.id,
          index: 0,
          won: false,
          drawn: true,
          result,
          game,
        };
        continue;
      }

      const winner = a.won ? a : b;
      const loser = a.won ? b : a;

      map[winner.id].breakers.wins += 1;
      map[winner.id].won.push(loser.id);
      map[loser.id].lost.push(winner.id);
      map[winner.id].games[index] = {
        color: winner.color,
        opponent: loser.id,
        index: 0,
        won: true,
        drawn: false,
        result,
        game,
      };
      map[loser.id].games[index] = {
        color: loser.color,
        opponent: winner.id,
        index: 0,
        won: false,
        drawn: false,
        result,
        game,
      };
    }
  }

  // calculate sos & sodos
  for (const id in map) {
    const player = map[id];

    for (const won of player.won) {
      player.breakers.sos += map[won].breakers.wins;
      player.breakers.sodos += map[won].breakers.wins;
    }

    for (const lost of player.lost) {
      player.breakers.sos += map[lost].breakers.wins;
    }

    for (const drawn of player.drawn) {
      player.breakers.sos += map[drawn].breakers.wins;
    }
  }

  // calculate sosos
  for (const id in map) {
    const player = map[id];

    for (const won of player.won) {
      player.breakers.sosos += map[won].breakers.sos;
    }

    for (const lost of player.lost) {
      player.breakers.sosos += map[lost].breakers.sos;
    }

    for (const drawn of player.drawn) {
      player.breakers.sosos += map[drawn].breakers.sos;
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
      const picker = (p: TableResult) => p.breakers[breaker];

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
  for (const group of final) {
    const place = result.length + 1;

    for (const player of group) {
      player.place = place;
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
    map[player.id] = group.reduce(
      (r, p) => r + Number(player.won.includes(p.id)) + Number(player.drawn.includes(p.id)) * 0.5,
      0
    );
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
