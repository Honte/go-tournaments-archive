import type { Game, IndexedTablePlayerGame, LadderTableStage } from '@/schema/data';

export function createLadderTable(stage: LadderTableStage, games: Record<string, Game>): LadderTableStage['table'] {
  const { order, rounds, playoffs } = stage;

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

  for (const [place, players] of order.entries()) {
    for (const player of players.split(',')) {
      const id = player.trim();
      const entry: LadderTableStage['table'][number] = {
        id,
        place: place + 1,
        index: 0,
        games: new Array(rounds.length).fill(null),
        playoffs: [],
      };

      entry.index = table.push(entry);
      map[id] = entry;
    }
  }

  // collect wins & games
  for (const [index, round] of rounds.entries()) {
    for (const game of round) {
      const {
        players: [a, b],
        result,
      } = games[game];

      const winner = a.won ? a.id : b.id;
      const loser = a.won ? b.id : a.id;

      map[winner].games[index] = {
        opponent: loser,
        index: map[loser]?.index ?? 0,
        won: true,
        result,
        game,
      };
      map[loser].games[index] = {
        opponent: winner,
        index: map[winner]?.index ?? 0,
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
    } = games[game];

    const winner = a.won ? a.id : b.id;
    const loser = a.won ? b.id : a.id;

    map[winner].playoffs.push({
      opponent: loser,
      index: map[loser].index,
      won: true,
      result,
      game,
    } as IndexedTablePlayerGame);
    map[loser].playoffs.push({
      opponent: winner,
      index: map[winner].index,
      won: false,
      result,
      game,
    } as IndexedTablePlayerGame);
  }

  return table;
}
