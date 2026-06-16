import type { EventSummary } from '@/schema/data';
import type { EventConfig, EventData } from '@/schema/event';
import { loadTournamentDescription } from '@/data/description';
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
  const tournament = tournaments.find((t) => t.year === year);

  if (!tournament) {
    return undefined;
  }

  const description = await loadTournamentDescription(event, year);

  return {
    ...tournament,
    description,
  };
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

export async function getCategoryStats(event: EventConfig, category: string) {
  const { stats } = await getData(event);

  return stats.categories[category];
}

export async function getEventSummary(event: EventConfig): Promise<EventSummary> {
  const { summary } = await loadData(event);

  return summary;
}
