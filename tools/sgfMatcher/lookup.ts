import type { SgfInfo } from '@tools/sgfMatcher/types';
import { normalizePlayerName } from '@tools/sgfMatcher/utils';

export type PlayerLookupMap<T> = Map<string, T | null>;
export type PlayerLookupResult<T> = {
  black: T | null;
  white: T | null;
};

export function registerLookupEntry<T>(lookup: PlayerLookupMap<T>, entry: string, value: T, warn = true): void {
  registerNormalizedLookupEntry(lookup, entry, value, warn);

  const commaName = getCommaName(entry);

  if (commaName) {
    registerNormalizedLookupEntry(lookup, commaName, value, warn);
  }
}

function registerNormalizedLookupEntry<T>(lookup: PlayerLookupMap<T>, entry: string, value: T, warn: boolean): void {
  const normalized = normalizePlayerName(entry);

  if (normalized.length < 2) {
    return;
  }

  const existing = lookup.get(normalized);

  if (typeof existing === 'undefined') {
    lookup.set(normalized, value);
  } else if (existing !== value) {
    lookup.set(normalized, null); // mark lookup as ambiguous

    if (warn) {
      console.warn(
        `  Warning: skipped ambiguous normalized player "${normalized}" (${String(existing)} and ${String(value)})`
      );
    }
  }
}

function getCommaName(name: string): string | null {
  if (name.includes(',')) {
    return null;
  }

  const parts = name.trim().split(/\s+/);

  return parts.length > 1 ? `${parts.at(-1)}, ${parts.slice(0, -1).join(' ')}` : null;
}

export function resolveSgfLookup<T>(sgf: SgfInfo, playerLookup: PlayerLookupMap<T>): PlayerLookupResult<T> {
  return {
    black: lookupPlayerId(playerLookup, sgf.sgfBlackName) ?? lookupPlayerId(playerLookup, sgf.filenameBlackName),
    white: lookupPlayerId(playerLookup, sgf.sgfWhiteName) ?? lookupPlayerId(playerLookup, sgf.filenameWhiteName),
  };
}

export function resolvePlayersLookup<T>(
  playerLookup: PlayerLookupMap<T>,
  blackName: string | null,
  whiteName: string | null
): PlayerLookupResult<T> {
  return {
    black: lookupPlayerId(playerLookup, blackName),
    white: lookupPlayerId(playerLookup, whiteName),
  };
}

export function lookupPlayerId<T>(playerLookup: PlayerLookupMap<T>, name: string | null): T | null {
  if (!name) {
    return null;
  }

  const normalized = normalizePlayerName(name);
  const exactMatch = playerLookup.get(normalized);

  if (typeof exactMatch !== 'undefined') {
    return exactMatch;
  }

  const matches = new Set<T>();

  for (const part of name.split(/[\s,]+/)) {
    const normalizedPart = normalizePlayerName(part);

    if (normalizedPart.length < 2) {
      continue;
    }

    const match = playerLookup.get(normalizedPart);

    if (match !== null && typeof match !== 'undefined') {
      matches.add(match);
    }
  }

  return matches.size === 1 ? matches.values().next().value! : null;
}
