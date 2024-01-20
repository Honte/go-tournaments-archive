import { getRankValue } from '@/data/rank';

export function createTableWithoutRounds(stage, games, players) {
  const {games: gameIds} = stage;

  const results = {};
  for (const id of gameIds) {
    const [home, away] = games[id].players;
    const winner = home.won ? home.id : away.id;
    const loser = home.won ? away.id : home.id;

    (results[winner] ||= {
      id: winner,
      score: 0,
      games: {},
      rank: getRankValue(players[winner].rank)
    }).games[loser] = {
      opponent: loser,
      won: true,
      game: id
    };

    (results[loser] ||= {
      id: loser,
      score: 0,
      games: {},
      rank: getRankValue(players[loser].rank)
    }).games[winner] = {
      opponent: winner,
      won: false,
      game: id
    };

    results[winner].score++;
  }

  return Object.values(results)
    .sort((a, b) => {
      const score = b.score - a.score;

      if (score === 0) {
        return b.rank - a.rank
      }

      return score;
    })
    .map((p, index) => {
      return {
        ...p,
        place: index + 1
      };
    });
}
