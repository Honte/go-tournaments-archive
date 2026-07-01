import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { unzipSync } from 'fflate';
import type { EventPlayer } from '@/data/eventPlayers';
import { getPlayerHash } from '@/data/players';

const EGD_DOWNLOAD_URL = 'https://europeangodatabase.eu/EGD/EGD_2_0/downloads/allworld_lp.zip';
const EGD_CACHE_PATH = path.join('temp', 'egd', 'allworld_lp.zip');

export type EgdPlayer = {
  pin: number;
  name: string;
  country: string;
};

export type EgdEnrichmentResult = {
  newlyMatched: number;
  alreadyMatched: number;
  unmatched: string[];
  ambiguous: string[];
  conflicts: string[];
  countryMismatches: string[];
};

export async function ensureEgdArchive(force: boolean): Promise<string> {
  if (!force && existsSync(EGD_CACHE_PATH)) {
    return EGD_CACHE_PATH;
  }

  const response = await fetch(EGD_DOWNLOAD_URL);

  if (!response.ok) {
    throw new Error(`Failed to download EGD players list: ${response.status} ${response.statusText}`);
  }

  await mkdir(path.dirname(EGD_CACHE_PATH), { recursive: true });
  await writeFile(EGD_CACHE_PATH, Buffer.from(await response.arrayBuffer()));

  return EGD_CACHE_PATH;
}

export async function readEgdPlayersFromZip(filePath: string): Promise<EgdPlayer[]> {
  const entries = unzipSync(new Uint8Array(await readFile(filePath)));
  const htmlEntry = Object.entries(entries).find(([name]) => name.endsWith('.html'));

  if (!htmlEntry) {
    throw new Error(`No HTML player list found in ${filePath}`);
  }

  return parseEgdPlayers(new TextDecoder().decode(htmlEntry[1]));
}

export function parseEgdPlayers(content: string): EgdPlayer[] {
  const players: EgdPlayer[] = [];
  const lineRegex = /^\s*(?<pin>\d{8})\s+(?<name>.*?)\s+(?<country>[A-Za-z]{2})\s+\S+\s+\S+\s+\S+\s+-?\d+\s+\d+\s+\S+/;

  for (const line of content.split(/\r?\n/)) {
    const match = line.match(lineRegex);

    if (!match?.groups) {
      continue;
    }

    players.push({
      pin: Number(match.groups.pin),
      name: match.groups.name.replaceAll('_', ' ').replace(/\s+/g, ' ').trim(),
      country: match.groups.country.toUpperCase(),
    });
  }

  return players;
}

export function enrichPlayersWithEgd(
  players: EventPlayer[],
  egdPlayers: EgdPlayer[],
  {
    includeCountry,
    savedPlayers = [],
  }: {
    includeCountry: boolean;
    savedPlayers?: EventPlayer[];
  }
): EgdEnrichmentResult {
  const lookup = buildEgdLookup(egdPlayers);
  const savedCountries = buildSavedCountries(savedPlayers);
  const result: EgdEnrichmentResult = {
    newlyMatched: 0,
    alreadyMatched: 0,
    unmatched: [],
    ambiguous: [],
    conflicts: [],
    countryMismatches: [],
  };

  for (const player of players) {
    const matches = findEgdMatches(player, lookup);

    if (matches.length === 0) {
      result.unmatched.push(player.name);
      continue;
    }

    if (matches.length > 1) {
      result.ambiguous.push(`${player.name} (${matches.map((match) => match.pin).join(', ')})`);
      continue;
    }

    const match = matches[0];

    if (player.egd && player.egd !== match.pin) {
      result.conflicts.push(`${player.name} (${player.egd} vs ${match.pin})`);
      continue;
    }

    if (!player.egd) {
      player.egd = match.pin;
      result.newlyMatched++;
    } else {
      result.alreadyMatched++;
    }

    const savedCountry = savedCountries.get(player.id);

    if (includeCountry && savedCountry && savedCountry !== match.country) {
      result.countryMismatches.push(`${player.name} (saved ${savedCountry}, EGD ${match.country})`);
    }

    if (includeCountry && !player.country) {
      player.country = match.country;
    }
  }

  return result;
}

function buildSavedCountries(players: EventPlayer[]): Map<string, string> {
  const countries = new Map<string, string>();

  for (const player of players) {
    if (player.country) {
      countries.set(player.id, player.country);
    }
  }

  return countries;
}

function buildEgdLookup(players: EgdPlayer[]): Map<string, EgdPlayer[]> {
  const lookup = new Map<string, EgdPlayer[]>();

  for (const player of players) {
    for (const name of getEgdLookupNames(player.name)) {
      const hash = getPlayerHash(name);
      lookup.set(hash, [...(lookup.get(hash) ?? []), player]);
    }
  }

  return lookup;
}

function findEgdMatches(player: EventPlayer, lookup: Map<string, EgdPlayer[]>): EgdPlayer[] {
  const matches = new Map<number, EgdPlayer>();

  for (const name of [player.name, ...(player.original ? [player.original] : [])]) {
    for (const match of lookup.get(getPlayerHash(name)) ?? []) {
      matches.set(match.pin, match);
    }
  }

  return [...matches.values()];
}

function getEgdLookupNames(name: string): string[] {
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length < 2) {
    return [name];
  }

  return [name, [...parts.slice(1), parts[0]].join(' ')];
}
