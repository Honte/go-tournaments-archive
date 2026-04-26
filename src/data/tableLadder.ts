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
        games: new Array(rounds.length).fill(null),
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
      } = gamesMap[game];

      const winner = a.won ? a : b;
      const loser = a.won ? b : a;

      map[winner.id].games[index] = {
        color: winner.color,
        opponent: loser.id,
        index: map[loser.id]?.index ?? 0,
        won: true,
        result,
        game,
      };
      map[loser.id].games[index] = {
        color: loser.color,
        opponent: winner.id,
        index: map[winner.id]?.index ?? 0,
        won: false,
        result,
        game,
      };
    }
  }

  for (const game of playoffs ?? []) {
    const {
      players: [a, b],
      result,
    } = gamesMap[game];

    const winner = a.won ? a : b;
    const loser = a.won ? b : a;

    map[winner.id].playoffs.push({
      color: winner.color,
      opponent: loser.id,
      index: map[loser.id].index,
      won: true,
      result,
      game,
    } as IndexedTablePlayerGame);
    map[loser.id].playoffs.push({
      color: loser.color,
      opponent: winner.id,
      index: map[winner.id].index,
      won: false,
      result,
      game,
    } as IndexedTablePlayerGame);
  }

  return table;
}
