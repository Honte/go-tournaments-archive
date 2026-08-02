import type { Game, IndexedTablePlayerGame, LadderTableStage } from '@/schema/data';

export function createLadderTable({
  order,
  rounds,
  playoffs,
  gamesMap,
}: {
  order: string[];
  rounds: string[][];
  playoffs: string[];
  gamesMap: Record<string, Game>;
}): LadderTableStage['table'] {
  const table: LadderTableStage['table'] = [];
  const map: Record<string, LadderTableStage['table'][number]> = {
    BYE: {
      id: 'BYE',
      place: 0,
      index: 0,
      games: [],
      playoffs: [],
    },
  };

  for (const players of order) {
    const place = table.length + 1;

    for (const player of players.split(',')) {
      const id = player.trim();
      const entry: LadderTableStage['table'][number] = {
        id,
        place,
        index: table.length + 1,
        games: Array.from({ length: rounds.length }, () => null),
        playoffs: [],
      };

      table.push(entry);
      map[id] = entry;
    }
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
        map[a.id].games[index] = {
          color: a.color,
          opponent: b.id,
          index: map[b.id]?.index ?? 0,
          won: false,
          drawn: true,
          result,
          game,
        };
        map[b.id].games[index] = {
          color: b.color,
          opponent: a.id,
          index: map[a.id]?.index ?? 0,
          won: false,
          drawn: true,
          result,
          game,
        };
        continue;
      }

      const winner = a.won ? a : b;
      const loser = a.won ? b : a;

      map[winner.id].games[index] = {
        color: winner.color,
        opponent: loser.id,
        index: map[loser.id]?.index ?? 0,
        won: true,
        drawn: false,
        result,
        game,
      };
      map[loser.id].games[index] = {
        color: loser.color,
        opponent: winner.id,
        index: map[winner.id]?.index ?? 0,
        won: false,
        drawn: false,
        result,
        game,
      };
    }
  }

  for (const game of playoffs ?? []) {
    const {
      players: [a, b],
      result,
      draw,
    } = gamesMap[game];

    if (draw) {
      map[a.id].playoffs.push({
        color: a.color,
        opponent: b.id,
        index: map[b.id].index,
        won: false,
        drawn: true,
        result,
        game,
      } as IndexedTablePlayerGame);
      map[b.id].playoffs.push({
        color: b.color,
        opponent: a.id,
        index: map[a.id].index,
        won: false,
        drawn: true,
        result,
        game,
      } as IndexedTablePlayerGame);
      continue;
    }

    const winner = a.won ? a : b;
    const loser = a.won ? b : a;

    map[winner.id].playoffs.push({
      color: winner.color,
      opponent: loser.id,
      index: map[loser.id].index,
      won: true,
      drawn: false,
      result,
      game,
    } as IndexedTablePlayerGame);
    map[loser.id].playoffs.push({
      color: loser.color,
      opponent: winner.id,
      index: map[winner.id].index,
      won: false,
      drawn: false,
      result,
      game,
    } as IndexedTablePlayerGame);
  }

  return table;
}
