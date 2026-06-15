import type { EventConfig, EventData } from '@/schema/event';
import { loadData } from '@/data/load';

const dataCache = new Map<string, Promise<EventData>>();

async function getData(event: EventConfig) {
  const cached = dataCache.get(event.id);

  if (cached) {
    return cached;
  }

  const data = loadData(event).catch((error: unknown) => {
    dataCache.delete(event.id);
    throw error;
  });

  dataCache.set(event.id, data);

  return data;
}

export async function getTournaments(event: EventConfig) {
  const { tournaments } = await getData(event);

  return tournaments;
}

export async function getTournament(event: EventConfig, year: number) {
  const { tournaments } = await getData(event);

  return tournaments.find((t) => t.year === year);
}

export async function getTournamentList(event: EventConfig) {
  const { tournaments } = await getData(event);

  return tournaments.map((t) => ({
    year: t.year,
    location: t.location,
    country: t.country,
    hasSgfs: t.hasSgfs,
  }));
}

export async function getAvailableTournaments(event: EventConfig) {
  const { tournaments } = await getData(event);

  return tournaments.map((t) => t.year);
}

export async function getAllPlayersStats(event: EventConfig) {
  const { stats } = await getData(event);

  return stats.players;
}

export async function getPlayerStats(event: EventConfig, playerId: string) {
  const { stats } = await getData(event);

  return stats.players[playerId];
}

export async function getAllCountriesStats(event: EventConfig) {
  const { stats } = await getData(event);

  return stats.countries;
}

export async function getCountryStats(event: EventConfig, country: string) {
  const { stats } = await getData(event);

  return stats.countries[country];
}

export async function getPlayerMedalists(event: EventConfig) {
  const { stats } = await getData(event);

  return Object.values(stats.players)
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function getCountryMedals(event: EventConfig) {
  const { stats } = await getData(event);

  return Object.values(stats.countries)
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score);
}

export async function getTopAttendants(event: EventConfig, limit: number) {
  const { stats } = await getData(event);

  return Object.values(stats.players)
    .sort((a, b) => b.totalAttended - a.totalAttended)
    .slice(0, limit);
}

export async function getTotalStats(event: EventConfig) {
  const { stats } = await getData(event);

  return stats.summary;
}

export async function getCategoryStats(event: EventConfig, category: string) {
  const { stats } = await getData(event);

  return stats.categories[category];
}
