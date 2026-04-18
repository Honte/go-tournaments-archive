import { buildLocalGameId } from '@/libs/h9';
import {
  type Color,
  type H9GameRecord,
  type ParsedGameEntry,
  type PlayerNames,
  type SgfInfo,
  type SgfPlaces,
  UNKNOWN_PLACE,
} from './types';
import { flipColor, normalizePlayerName } from './utils';

export type WinnerPart = {
  winnerPlace: number | typeof UNKNOWN_PLACE;
  resultStr: string | null;
};

export function matchSgfs(
  sgfInfos: SgfInfo[],
  playersMap: Map<string, number>,
  h9gamesMap: Map<string, H9GameRecord>,
  yamlGames: Map<string, ParsedGameEntry>,
  force?: boolean
): { matchedEntries: string[]; unmatchedSgfs: SgfInfo[] } {
  const matchedEntries: string[] = [];
  const matchedGameIds = new Set<string>();
  const unmatchedSgfs: SgfInfo[] = [];

  for (const sgf of sgfInfos) {
    if (sgf.corrupted && (force || !hasSgf(yamlGames, sgf.path))) {
      unmatchedSgfs.push(sgf);
      continue;
    }

    const localId =
      resolveLocalId(sgf.metadata, sgf.round, playersMap, h9gamesMap) ??
      resolveLocalId(sgf.fromFilename, sgf.round, playersMap, h9gamesMap);

    if (!localId) {
      unmatchedSgfs.push(sgf);
      continue;
    }

    if (matchedGameIds.has(localId)) {
      console.warn(`  Warning: duplicate match for localId ${localId}: ${sgf.path} (already matched)`);
      unmatchedSgfs.push(sgf);
      continue;
    }

    const h9Record = h9gamesMap.get(localId);

    if (!h9Record) {
      console.warn(`  Warning: cannot find H9 record for ${localId}: ${sgf.path}`);
      unmatchedSgfs.push(sgf);
      continue;
    }

    const yamlGame = yamlGames.get(localId);

    if (yamlGame && !force) {
      continue;
    }

    const sgfPlaces = resolveSgfPlaces(sgf, playersMap);

    if (!verifyColors(h9Record, sgfPlaces)) {
      console.warn(
        `  Warning: color mismatch for ${sgf.path} — H9 says place ${h9Record.homePlace} played ${h9Record.homeColor}, SGF disagrees`
      );
      unmatchedSgfs.push(sgf);
      continue;
    }

    matchedEntries.push(buildGameString(h9Record, sgf, sgfPlaces, yamlGame?.props));
    matchedGameIds.add(localId);
  }

  return { matchedEntries, unmatchedSgfs };
}

function lookupPlace(name: string | null, playerLookup: Map<string, number>): number | null {
  return name ? (playerLookup.get(normalizePlayerName(name)) ?? null) : null;
}

function resolveLocalId(
  names: PlayerNames,
  round: number | null,
  playersMap: Map<string, number>,
  h9gamesMap: Map<string, H9GameRecord>
): string | null {
  const places: number[] = [];

  for (const name of [names.blackName, names.whiteName]) {
    const place = lookupPlace(name, playersMap);
    if (place !== null) {
      places.push(place);
    }
  }

  if (places.length < 2) {
    return null;
  }

  if (round !== null) {
    return buildLocalGameId(places[0], places[1], round);
  }

  const candidates: string[] = [];
  for (const [key, record] of h9gamesMap) {
    if (
      (record.homePlace === places[0] && record.awayPlace === places[1]) ||
      (record.homePlace === places[1] && record.awayPlace === places[0])
    ) {
      candidates.push(key);
    }
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  return null;
}

export function resolveSgfPlaces(sgf: SgfInfo, playerLookup: Map<string, number>): SgfPlaces {
  return {
    blackPlace:
      lookupPlace(sgf.metadata.blackName, playerLookup) ?? lookupPlace(sgf.fromFilename.blackName, playerLookup),
    whitePlace:
      lookupPlace(sgf.metadata.whiteName, playerLookup) ?? lookupPlace(sgf.fromFilename.whiteName, playerLookup),
  };
}

export function formatSgfWinner(sgf: SgfInfo, places: SgfPlaces): WinnerPart {
  const { cleanResult } = sgf;

  if (!cleanResult || (cleanResult[0] !== 'B' && cleanResult[0] !== 'W')) {
    return { winnerPlace: UNKNOWN_PLACE, resultStr: null };
  }

  const isBlack = cleanResult[0] === 'B';
  const wp = isBlack ? places.blackPlace : places.whitePlace;

  return {
    winnerPlace: wp ?? UNKNOWN_PLACE,
    resultStr: cleanResult.replace(/\+$/, ''),
  };
}

function verifyColors(h9Record: H9GameRecord, sgfPlaces: SgfPlaces): boolean {
  if (!h9Record.homeColor) {
    return true;
  }

  const awayColor = flipColor(h9Record.homeColor);
  const { blackPlace, whitePlace } = sgfPlaces;

  if (blackPlace === h9Record.homePlace || whitePlace === h9Record.homePlace) {
    const sgfHomeColor: Color = blackPlace === h9Record.homePlace ? 'black' : 'white';
    return sgfHomeColor === h9Record.homeColor;
  }

  if (blackPlace === h9Record.awayPlace || whitePlace === h9Record.awayPlace) {
    const sgfAwayColor: Color = blackPlace === h9Record.awayPlace ? 'black' : 'white';
    return sgfAwayColor === awayColor;
  }

  return true;
}

function buildGameString(h9Record: H9GameRecord, sgf: SgfInfo, sgfPlaces: SgfPlaces, props?: string): string {
  const blackPlace = sgfPlaces.blackPlace ?? h9Record.homePlace;
  const whitePlace = blackPlace === h9Record.homePlace ? h9Record.awayPlace : h9Record.homePlace;
  const places = `${blackPlace}-${whitePlace}`;

  let { winnerPlace, resultStr } = formatSgfWinner(sgf, sgfPlaces);

  if (resultStr === null && h9Record.winnerPlace !== null) {
    winnerPlace = h9Record.winnerPlace;

    if (h9Record.homeColor) {
      const prefix = h9Record.winnerColor === 'black' ? 'B' : 'W';
      const suffix = sgf.rawResult ? sgf.rawResult.replace(/\s+/g, '_') : '';

      resultStr = suffix ? `${prefix}+${suffix}` : prefix;
    }
  }

  const winnerPart = resultStr ? `${winnerPlace}:${resultStr}` : String(winnerPlace);

  return `${places} ${winnerPart} round:${h9Record.round} sgf:${sgf.path} ${props || ''}`.trim();
}

function hasSgf(parsedGamesMap: Map<string, ParsedGameEntry>, sgf: string) {
  for (const entry of parsedGamesMap.values()) {
    if (entry.sgf === sgf) {
      return true;
    }
  }

  return false;
}
