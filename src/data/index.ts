import { loadDefaultEvent } from '@/events';
import { loadData } from '@/data/load';

const { tournaments, stats } = await loadData(await loadDefaultEvent());

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
    hasSgfs: t.hasSgfs,
  }));
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
    .sort((a, b) => b.totalAttended - a.totalAttended)
    .slice(0, limit);
}

export async function getTotalStats() {
  return stats.summary;
}

export async function getCategoryStats(category: string) {
  return stats.categories[category];
}
