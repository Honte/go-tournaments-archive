export function createLadderTable(stage, games) {
  const { order, rounds, playoffs } = stage;

  const table = [];
  const map = {
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
      const entry = {
        id,
        place: place + 1,
        games: new Array(rounds.length).fill(null),
        playoffs: [],
      };

      entry.index = table.push(entry);
      map[id] = entry;
    }
  }

  // collect wins & games
  for (const [index, round] of stage.rounds.entries()) {
    for (const game of round) {
      const {
        players: [a, b],
        result,
      } = games[game];

      const winner = a.won ? a.id : b.id;
      const loser = a.won ? b.id : a.id;

      map[winner].games[index] = {
        opponent: loser,
        index: map[loser]?.index,
        won: true,
        result,
        game,
      };
      map[loser].games[index] = {
        opponent: winner,
        index: map[winner]?.index,
        won: false,
        result,
        game,
      };
    }
  }

  for (const game of playoffs) {
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
    });
    map[loser].playoffs.push({
      opponent: winner,
      index: map[winner].index,
      won: false,
      result,
      game,
    });
  }

  return table;
}
