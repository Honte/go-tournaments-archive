import type { ApiPlayerResult, ApiPlayerStats } from '@/schema/api';
import { calculateStats } from '@/data/stats';
import { loadTournaments } from './load';

const tournaments = await loadTournaments();
const stats = calculateStats(tournaments);

export async function getTournaments() {
  return tournaments;
}

export async function getTournament(year: number) {
  return tournaments.find((t) => t.year === year);
}

export async function getTournamentList() {
  return tournaments.map((t) => ({
    year: t.year,
    location: t.location,
    country: t.country,
  }));
}

export async function getAvailableTournaments() {
  return tournaments.map((t) => t.year);
}

export async function getAllPlayersStats() {
  return stats.players;
}

export async function getPlayerStats(playerId: string): Promise<ApiPlayerStats> {
  const player = stats.players[playerId];
  const events: Record<number, ApiPlayerResult> = {};
  const opponents: Record<string, string> = {};

  for (const result of player.results) {
    const event = (events[result.year] ||= {
      year: result.year,
      country: result.country,
      stages: [],
      place: result.finalPlace,
      rank: result.rank,
    });

    if (result.finalPlace && !event.place) {
      event.place = result.finalPlace;
    }

    event.stages.push({
      type: result.stage,
      place: result.place,
      games: result.games,
    });

    for (const game of result.games) {
      if (game.id !== 'BYE') {
        opponents[game.id] = stats.players[game.id].name;
      }
    }
  }

  return {
    id: player.id,
    name: player.name,
    country: player.countries,
    medals: player.medals,
    categoriesMedals: player.categoriesMedals,
    results: Object.values(events).sort((a, b) => a.year - b.year),
    bestPlace: player.bestPlace,
    totalGames: player.totalGames,
    totalWon: player.totalWon,
    opponents,
  };
}

export async function getAllCountriesStats() {
  return stats.countries;
}

export async function getCountryStats(country: string) {
  return stats.countries[country];
}

export async function getPlayerMedalists() {
  return Object.values(stats.players)
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function getCountryMedals() {
  return Object.values(stats.countries)
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function getTopAttendants(limit: number) {
  return Object.values(stats.players)
    .sort((a, b) => b.years.length - a.years.length)
    .slice(0, limit);
}

export async function getTotalStats() {
  return stats.summary;
}

export async function getCategoryStats(category: string) {
  return stats.categories[category];
}
