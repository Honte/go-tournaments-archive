import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  CategoryStats,
  CountryStats,
  EventSummary,
  PlayerStats,
  Tournament,
  TournamentWithDescription,
} from '@/schema/data';
import type { EventDefinition, EventContext, EventData } from '@/schema/event';
import type { SearchIndex } from '@/schema/search';
import type { Locale, Translations } from '@/i18n/consts';
import { loadTranslations } from '@/i18n/server';
import { loadTournamentDescription } from '@/data/description';
import { readEventPlayersFile } from '@/data/eventPlayers';
import { loadData } from '@/data/load';
import { buildSearchIndex } from '@/data/search';
import { IS_PRODUCTION } from '@/configuration';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '../../public');

const dataCache = new Map<string, Promise<EventData>>();
const dataAssetCache = new Map<string, Promise<unknown>>();

async function getData(event: EventDefinition) {
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

export async function getTournaments(event: EventContext) {
  if (IS_PRODUCTION) {
    return readDataAsset<Tournament[]>(event, 'tournaments.json');
  }

  const { tournaments } = await getData(event);

  return tournaments;
}

export async function getTournament(event: EventContext, year: number) {
  if (IS_PRODUCTION) {
    return readDataAsset<TournamentWithDescription>(event, `${year}.json`);
  }

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

export async function getTournamentList(event: EventContext) {
  const tournaments = await getTournaments(event);

  return tournaments.map((t) => ({
    year: t.year,
    location: t.location,
    country: t.country,
    hasSgfs: t.hasSgfs,
  }));
}

export async function getAvailableTournaments(event: EventContext) {
  const tournaments = await getTournaments(event);

  return tournaments.map((t) => t.year);
}

export async function getAllPlayersStats(event: EventContext) {
  if (IS_PRODUCTION) {
    return readDataAsset<Record<string, PlayerStats>>(event, join('stats', 'players.json'));
  }

  const { stats } = await getData(event);

  return stats.players;
}

export async function getPlayerStats(event: EventContext, playerId: string) {
  if (IS_PRODUCTION) {
    return readDataAsset<PlayerStats>(event, join('stats', 'player', `${playerId}.json`));
  }

  const players = await getAllPlayersStats(event);

  return players[playerId];
}

export async function getAllCountriesStats(event: EventContext) {
  if (IS_PRODUCTION) {
    return readDataAsset<Record<string, CountryStats>>(event, join('stats', 'countries.json'));
  }

  const { stats } = await getData(event);

  return stats.countries;
}

export async function getCountryStats(event: EventContext, country: string) {
  if (IS_PRODUCTION) {
    return readDataAsset<CountryStats>(event, join('stats', 'country', `${country.toLowerCase()}.json`));
  }

  const countries = await getAllCountriesStats(event);

  return countries[country];
}

export async function getCategoryStats(event: EventContext, category: string) {
  if (IS_PRODUCTION) {
    return readDataAsset<CategoryStats>(event, join('stats', 'category', `${category}.json`));
  }

  const { stats } = await getData(event);

  return stats.categories[category];
}

export async function getEventSummary(event: EventContext): Promise<EventSummary> {
  if (IS_PRODUCTION) {
    return readDataAsset<EventSummary>(event, join('stats', 'summary.json'));
  }

  const { summary } = await getData(event);

  return summary;
}

export async function getTranslations(event: EventContext, locale?: Locale): Promise<Translations> {
  if (IS_PRODUCTION) {
    return readDataAsset<Translations>(event, join('i18n', `${locale ?? event.locales[0]}.json`));
  }

  return loadTranslations(event, locale);
}

export async function getSearchIndex(event: EventContext, locale: Locale): Promise<SearchIndex> {
  if (IS_PRODUCTION) {
    return readDataAsset<SearchIndex>(event, join('search', `${locale}.json`));
  }

  const [data, translations, eventPlayers] = await Promise.all([
    getData(event),
    loadTranslations(event, locale),
    readEventPlayersFile(event.id),
  ]);

  return buildSearchIndex(event, data, translations, eventPlayers);
}

async function readDataAsset<T>(event: EventContext, file: string): Promise<T> {
  const normalizedFile = file.replaceAll('\\', '/');
  const cacheKey = `${event.id}:${normalizedFile}`;
  const cached = dataAssetCache.get(cacheKey);

  if (cached) {
    return cached as Promise<T>;
  }

  const data = readDataAssetFromDisk<T>(event, normalizedFile).catch((error: unknown) => {
    dataAssetCache.delete(cacheKey);
    throw error;
  });

  dataAssetCache.set(cacheKey, data);

  return data;
}

async function readDataAssetFromDisk<T>(event: EventContext, file: string): Promise<T> {
  const assetPath = join(/*turbopackIgnore: true*/ PUBLIC_DIR, 'data', event.prefix || '', file);

  try {
    return JSON.parse(await readFile(/*turbopackIgnore: true*/ assetPath, 'utf-8')) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
      throw new Error(
        `[data] Missing prebuilt data asset for ${event.id}: ${assetPath}. Run the asset prebuild before production data access.`
      );
    }

    throw new Error(`[data] Failed to read prebuilt data asset for ${event.id}: ${assetPath}.`, { cause: error });
  }
}
