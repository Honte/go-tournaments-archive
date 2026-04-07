import { StatsPlayer } from '@/schema/data';
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

export async function getAvailableTournaments() {
  return tournaments.map((t) => t.year);
}

export async function getAllPlayersStats() {
  return stats.players;
}

export async function getPlayerStats(playerId: string) {
  return stats.players[playerId];
}

export async function getPlayerOpponentsStats(playerId: string) {
  const player = stats.players[playerId];
  const opponents: Record<string, StatsPlayer> = {};

  for (const event of player.results) {
    for (const game of event.games) {
      opponents[game.opponent] ||= stats.players[game.opponent];
    }
  }

  return opponents;
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
