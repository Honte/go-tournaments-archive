import type { Game, Player, RoundRobinTableStage } from '@/schema/data';
import { getRankValue } from '@/libs/rank';

export function createTableWithoutRounds({
  games,
  gamesMap,
  playersMap,
}: {
  games: string[];
  gamesMap: Record<string, Game>;
  playersMap: Record<string, Player>;
}): RoundRobinTableStage['table'] {
  const results: Record<string, RoundRobinTableStage['table'][number]> = {};

  for (const id of games) {
    const {
      players: [home, away],
      result,
      draw,
    } = gamesMap[id];
    if (draw) {
      for (const [player, opponent] of [
        [home, away],
        [away, home],
      ] as const) {
        const entry = (results[player.id] ||= {
          id: player.id,
          place: 0,
          score: 0,
          games: [],
          rank: getRankValue(playersMap[player.id].rank),
        });

        entry.games.push({
          color: player.color,
          opponent: opponent.id,
          won: false,
          drawn: true,
          result,
          game: id,
        });
        entry.score += 0.5;
      }
      continue;
    }

    const winner = home.won ? home : away;
    const loser = home.won ? away : home;

    (results[winner.id] ||= {
      id: winner.id,
      place: 0,
      score: 0,
      games: [],
      rank: getRankValue(playersMap[winner.id].rank),
    }).games.push({
      color: winner.color,
      opponent: loser.id,
      won: true,
      drawn: false,
      result,
      game: id,
    });

    (results[loser.id] ||= {
      id: loser.id,
      place: 0,
      score: 0,
      games: [],
      rank: getRankValue(playersMap[loser.id].rank),
    }).games.push({
      color: loser.color,
      opponent: winner.id,
      won: false,
      drawn: false,
      result,
      game: id,
    });

    results[winner.id].score++;
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
