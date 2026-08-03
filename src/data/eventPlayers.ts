import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

export type EventPlayer = {
  id: string;
  name: string;
  country?: string;
  egd?: number;
  original?: string;
  nickname: string[];
  pastNames: string[];
};

export function getEventPlayersPath(eventId: string): string {
  return path.join('events', eventId, 'players.yml');
}

export async function readEventPlayersFile(eventId: string): Promise<EventPlayer[]> {
  const filePath = getEventPlayersPath(eventId);

  try {
    return parseEventPlayers(await readFile(filePath, 'utf-8'), filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export function parseEventPlayers(content: string, source = 'players.yml'): EventPlayer[] {
  const parsed = parse(content) as { players?: unknown[] } | null;

  if (!parsed?.players) {
    return [];
  }

  if (!Array.isArray(parsed.players)) {
    throw new Error(`${source}: players must be a list`);
  }

  return parsed.players.map((player, index) => normalizeEventPlayer(player, `${source}: players[${index}]`));
}

function normalizeEventPlayer(player: unknown, source: string): EventPlayer {
  if (!isRecord(player)) {
    throw new Error(`${source}: player must be an object`);
  }

  const id = readRequiredString(player.id, `${source}.id`);
  const name = readRequiredString(player.name, `${source}.name`);

  return {
    id,
    name,
    country: readOptionalString(player.country),
    egd: readOptionalNumber(player.egd, `${source}.egd`),
    original: readOptionalString(player.original, `${source}.original`),
    nickname: readStringList(player.nickname, `${source}.nickname`),
    pastNames: readStringList(player.pastNames, `${source}.pastNames`),
  };
}

function readRequiredString(value: unknown, field: string): string {
  const result = readOptionalString(value);

  if (!result) {
    throw new Error(`${field} is required`);
  }

  return result;
}

function readOptionalString(value: unknown, field?: string): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new Error(`${field ?? 'value'} must be a string`);
  }

  return value.trim() || undefined;
}

function readOptionalNumber(value: unknown, field: string): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const result = Number(value);

  if (!Number.isInteger(result)) {
    throw new Error(`${field} must be an integer`);
  }

  return result;
}

function readStringList(value: unknown, field: string): string[] {
  if (value === undefined || value === null) {
    return [];
  }

  if (typeof value === 'string') {
    return value.trim() ? [value.trim()] : [];
  }

  if (!Array.isArray(value)) {
    throw new Error(`${field} must be a string or a list of strings`);
  }

  return value.map((item, index) => readRequiredString(item, `${field}[${index}]`));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
