import type { CountryResult, CountryStats, PlayerStageResult } from '@/schema/data';

export function getCountryAvailableCategories(country: CountryStats, categories: readonly string[]) {
  const available = new Set<string>();

  for (const year in country.years) {
    for (const result of country.years[year].results) {
      for (const stage of result.stages) {
        if (stage.categories) {
          for (const category in stage.categories) {
            available.add(category);
          }
        }
      }
    }
  }

  return categories.filter((category) => available.has(category));
}

export function filterCountryStatsByCategory(country: CountryStats, category: string): CountryStats {
  const years: Record<number, CountryResult> = {};
  let totalGames = 0;
  let totalWon = 0;
  let bestPlace = Infinity;

  for (const year in country.years) {
    const tournament = country.years[year];
    const filteredTournament: CountryResult = {
      year: tournament.year,
      bestPlace: Infinity,
      totalGames: 0,
      totalWon: 0,
      results: [],
    };

    for (const result of tournament.results) {
      const stages = [];

      for (const stage of result.stages) {
        if (!stage.categories?.[category]) {
          continue;
        }

        const games = stage.games.length;
        const won = stage.games.reduce((total, game) => total + Number(game.won), 0);
        const place = stage.categories ? stage.categories?.[category] : stage.place;

        filteredTournament.totalGames += games;
        filteredTournament.totalWon += won;

        stages.push({
          ...stage,
          categories: {
            [category]: place,
          },
        });

        if (typeof place === 'number') {
          filteredTournament.bestPlace = Math.min(filteredTournament.bestPlace, place);
        }
      }

      if (stages.length) {
        filteredTournament.results.push({
          ...result,
          stages,
        });
      }
    }

    if (filteredTournament.results.length) {
      years[filteredTournament.year] = filteredTournament;
      totalGames += filteredTournament.totalGames;
      totalWon += filteredTournament.totalWon;
      bestPlace = Math.min(bestPlace, filteredTournament.bestPlace);
    }
  }

  return {
    ...country,
    categoriesMedals: {
      [category]: country.categoriesMedals[category],
    },
    medals: country.categoriesMedals[category],
    bestPlace,
    totalGames,
    totalWon,
    years,
  };
}

export function hasStageCategory(stage: PlayerStageResult, category?: string) {
  return !category || stage.categories?.[category] !== undefined;
}

export function getStageCategoryPlace(stage: PlayerStageResult, category?: string) {
  return category ? stage.categories?.[category] : stage.place;
}
