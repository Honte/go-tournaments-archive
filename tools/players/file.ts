import { readFile, writeFile } from 'node:fs/promises';
import { isMap, isScalar, isSeq, parseDocument, type YAMLMap, type YAMLSeq } from 'yaml';
import type { EventPlayer } from '@/data/eventPlayers';
import { getEventPlayersPath, parseEventPlayers } from '@/data/eventPlayers';

type EventPlayerOutput = {
  id: string;
  name: string;
  country?: string;
  egd?: number;
  original?: string;
  nickname?: string | string[];
};

type UpdateEventPlayersResult = {
  content: string;
  added: number;
  updated: number;
  changed: boolean;
};

type UpdateEventPlayersOptions = {
  includeCountry: boolean;
  updateExisting?: boolean;
};

export async function updateEventPlayersFile(
  eventId: string,
  players: EventPlayer[],
  { includeCountry, updateExisting = false }: UpdateEventPlayersOptions
): Promise<UpdateEventPlayersResult> {
  const filePath = getEventPlayersPath(eventId);
  let content = '';

  try {
    content = await readFile(filePath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error;
    }
  }

  const result = updateEventPlayersContent(content, players, { includeCountry, updateExisting });

  if (result.changed) {
    await writeFile(filePath, result.content, 'utf-8');
  }

  return result;
}

export function updateEventPlayersContent(
  content: string,
  players: EventPlayer[],
  { includeCountry, updateExisting = false }: UpdateEventPlayersOptions
): UpdateEventPlayersResult {
  const doc = parseDocument(content);
  const existingPlayers = content.trim() ? parseEventPlayers(content) : [];
  const existingIds = new Set(existingPlayers.map((player) => player.id));
  const root = ensureRootMap(doc);
  const playersNode = ensurePlayersSeq(doc, root);
  let added = 0;
  let updated = 0;

  if (updateExisting) {
    for (const item of playersNode.items) {
      if (!isMap(item)) {
        continue;
      }

      const id = getMapString(item, 'id');
      const player = id ? players.find((candidate) => candidate.id === id) : undefined;

      if (!player) {
        continue;
      }

      if (setPlayerMapFields(doc, item, player, includeCountry, { onlyMissing: true })) {
        updated++;
      }
    }
  }

  for (const player of players) {
    if (existingIds.has(player.id)) {
      continue;
    }

    playersNode.add(doc.createNode(formatEventPlayer(player, includeCountry)));
    existingIds.add(player.id);
    added++;
  }

  const changed = added > 0 || updated > 0;

  return {
    content: changed ? doc.toString({ lineWidth: 0 }) : content,
    added,
    updated,
    changed,
  };
}

export function mergeEventPlayers(existing: EventPlayer[], discovered: EventPlayer[]): EventPlayer[] {
  const results = new Map<string, EventPlayer>();

  for (const player of existing) {
    results.set(player.id, cloneEventPlayer(player));
  }

  for (const player of discovered) {
    const current = results.get(player.id);

    if (!current) {
      results.set(player.id, cloneEventPlayer(player));
      continue;
    }

    if (!current.name) {
      current.name = player.name;
    }

    if (!current.country && player.country) {
      current.country = player.country;
    }

    if (!current.egd && player.egd) {
      current.egd = player.egd;
    }

    if (!current.original && player.original) {
      current.original = player.original;
    }

    current.nickname = mergeStrings(current.nickname, player.nickname);
  }

  return [...results.values()].sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

function toEventPlayerNickname(value: string[]): string | string[] | undefined {
  if (value.length === 0) {
    return undefined;
  }

  return value.length === 1 ? value[0] : value;
}

function formatEventPlayer(player: EventPlayer, includeCountry: boolean): EventPlayerOutput {
  return removeUndefined({
    id: player.id,
    name: player.name,
    country: includeCountry ? player.country : undefined,
    egd: player.egd,
    original: player.original,
    nickname: toEventPlayerNickname(player.nickname),
  });
}

function ensureRootMap(doc: ReturnType<typeof parseDocument>): YAMLMap<unknown, unknown> {
  if (!doc.contents) {
    const root = doc.createNode({});
    doc.contents = root;

    if (!isMap(root)) {
      throw new Error('Could not create players.yml root map');
    }

    return root;
  }

  if (!isMap(doc.contents)) {
    throw new Error('players.yml root must be a map');
  }

  return doc.contents;
}

function ensurePlayersSeq(
  doc: ReturnType<typeof parseDocument>,
  root: ReturnType<typeof ensureRootMap>
): YAMLSeq<unknown> {
  const playersNode = root.get('players', true);

  if (!playersNode) {
    const seq = doc.createNode([]);
    root.set('players', seq);

    if (!isSeq(seq)) {
      throw new Error('Could not create players.yml players list');
    }

    return seq;
  }

  if (!isSeq(playersNode)) {
    throw new Error('players.yml players must be a list');
  }

  return playersNode;
}

function setPlayerMapFields(
  doc: ReturnType<typeof parseDocument>,
  node: YAMLMap<unknown, unknown>,
  player: EventPlayer,
  includeCountry: boolean,
  { onlyMissing }: { onlyMissing: boolean }
): boolean {
  const output = formatEventPlayer(player, includeCountry);
  let changed = false;

  for (const [key, value] of Object.entries(output)) {
    if (key === 'id' || key === 'name') {
      continue;
    }

    if (onlyMissing && hasMapValue(node, key)) {
      continue;
    }

    node.set(key, doc.createNode(value));
    changed = true;
  }

  return changed;
}

function getMapString(node: YAMLMap<unknown, unknown>, key: string): string | undefined {
  const value = node.get(key, true);
  return isScalar(value) && typeof value.value === 'string' ? value.value : undefined;
}

function hasMapValue(node: YAMLMap<unknown, unknown>, key: string): boolean {
  const value = node.get(key, true);
  return value !== undefined && value !== null;
}

function cloneEventPlayer(player: EventPlayer): EventPlayer {
  return {
    ...player,
    nickname: [...player.nickname],
  };
}

function mergeStrings(a: string[], b: string[]): string[] {
  const result: string[] = [];
  const seen = new Set<string>();

  for (const value of [...a, ...b]) {
    if (!seen.has(value)) {
      result.push(value);
      seen.add(value);
    }
  }

  return result;
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T;
}
