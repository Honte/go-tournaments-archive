import type { Game, Player, RoundRobinTableStage } from '@/schema/data';
import { getRankValue } from '@/data/rank';

export function createTableWithoutRounds(
  stage: RoundRobinTableStage,
  games: Record<string, Game>,
  players: Record<string, Player>
): RoundRobinTableStage['table'] {
  const { games: gameIds } = stage;

  const results: Record<string, RoundRobinTableStage['table'][number]> = {};

  for (const id of gameIds) {
    const {
      players: [home, away],
      result,
    } = games[id];
    const winner = home.won ? home.id : away.id;
    const loser = home.won ? away.id : home.id;

    (results[winner] ||= {
      id: winner,
      place: 0,
      score: 0,
      games: [],
      rank: getRankValue(players[winner].rank),
    }).games.push({
      opponent: loser,
      won: true,
      result,
      game: id,
    });

    (results[loser] ||= {
      id: loser,
      place: 0,
      score: 0,
      games: [],
      rank: getRankValue(players[loser].rank),
    }).games.push({
      opponent: winner,
      won: false,
      result,
      game: id,
    });

    results[winner].score++;
  }

  return Object.values(results)
    .sort((a, b) => {
      const score = b.score - a.score;

      if (score === 0) {
        return b.rank - a.rank;
      }

      return score;
    })
    .map((p, index) => ({
      ...p,
      place: index + 1,
    }));
}
