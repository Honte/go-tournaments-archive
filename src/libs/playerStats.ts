import type { PlayerResult, PlayerStats } from '@/schema/data';

export function getPlayerAvailableCategories(player: PlayerStats, categories: readonly string[]) {
  const available = new Set<string>();

  for (const result of player.results) {
    for (const stage of result.stages) {
      if (stage.categories) {
        for (const category in stage.categories) {
          available.add(category);
        }
      }
    }
  }

  return categories.filter((category) => available.has(category));
}

export function filterPlayerStatsByCategory(player: PlayerStats, category: string): PlayerStats {
  const results: PlayerResult[] = [];
  const opponents: Record<string, string> = {};
  const medals = player.categoriesMedals[category] ?? [[], [], []];
  let totalGames = 0;
  let totalWon = 0;
  let totalSgfs = 0;
  let bestPlace = Infinity;

  for (const result of player.results) {
    const stages = [];
    let place = Infinity;

    for (const stage of result.stages) {
      const categoryPlace = stage.categories?.[category];

      if (categoryPlace === undefined) {
        continue;
      }

      const games = stage.games.length;
      const won = stage.games.reduce((total, game) => total + Number(game.won), 0);

      totalGames += games;
      totalWon += won;
      totalSgfs += stage.games.filter((game) => game.props?.sgf).length;

      for (const game of stage.games) {
        const opponent = player.opponents[game.id];

        if (opponent) {
          opponents[game.id] = opponent;
        }
      }

      stages.push({
        ...stage,
        categories: {
          [category]: categoryPlace,
        },
      });

      if (typeof categoryPlace === 'number') {
        place = Math.min(place, categoryPlace);
        bestPlace = Math.min(bestPlace, categoryPlace);
      }
    }

    if (stages.length) {
      results.push({
        ...result,
        place,
        stages,
      });
    }
  }

  const [gold, silver, bronze] = medals;

  return {
    ...player,
    medals,
    categoriesMedals: {
      [category]: medals,
    },
    results,
    opponents,
    bestPlace,
    totalGames,
    totalWon,
    totalAttended: results.length,
    totalSgfs,
    score: gold.length * 10_000 + silver.length * 100 + bronze.length,
  };
}
