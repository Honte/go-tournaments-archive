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

export async function getStats() {
  return calculateStats(tournaments);
}

export async function getPlayersStats() {
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

export async function getCountryStats(country: string) {
  return stats.countries[country];
}
