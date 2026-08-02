import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { InputTournamentStage } from '@/schema/input';
import { JIGO } from '@/libs/games';
import { buildLocalGameId, type H9Player, parseH9 } from '@/libs/h9';
import type { EventPlayer } from '@/data/eventPlayers';
import { GAME_REGEX } from '@/data/games';
import { buildSgfEntryString, type SgfMatchResult } from './entries';
import { lookupPlayerId, type PlayerLookupMap, registerLookupEntry, resolveSgfLookup } from './lookup';
import {
  buildCommonUnmatchedReasons,
  findDuplicateKeys,
  formatSgfWinner,
  getSgfRound,
  MATCHES_SAME_GAME_AS_OTHER_FILE_REASON,
  MATCHING_GAME_ALREADY_HAS_SGF_REASON,
  OGS_CONFLICT_REASON,
} from './match';
import { loadSgfInfos, parseFilename } from './sgf';
import {
  type Color,
  type H9GameRecord,
  type ParsedGameEntry,
  type RemovedEntry,
  type SgfInfo,
  type SgfPlaces,
  type StageAnalysisResult,
  UNKNOWN_PLACE,
  type UnmatchedEntry,
} from './types';
import { flipColor, normalizePlayerName, parseProps } from './utils';

type ImplicitLookup = PlayerLookupMap<number>;

type ImplicitCandidate = {
  sgf: SgfInfo;
  localId: string;
  h9Record: H9GameRecord;
  places: SgfPlaces;
  props?: Record<string, string>;
};

export async function processImplicitStage({
  stage,
  sgfPaths,
  sgfDir,
  dataDir,
  force,
  strict,
  eventPlayers,
}: {
  stage: InputTournamentStage;
  sgfPaths: string[];
  dataDir: string;
  sgfDir: string;
  force: boolean;
  strict: boolean;
  eventPlayers: EventPlayer[];
}): Promise<StageAnalysisResult> {
  const tournamentFilePath = path.join(dataDir, stage.file);
  const tournamentFileContent = await readFile(tournamentFilePath, 'utf-8');
  const tournament = parseH9(tournamentFileContent);

  const playersMap = buildPlayersMap(tournament.results, eventPlayers);
  const gamesMap = buildGamesMap(tournament.results);

  const existingGamesById = new Map<string, ParsedGameEntry>();
  const existingGamesBySgf = new Map<string, ParsedGameEntry>();
  const previousEntries: string[] = [];

  if (Array.isArray(stage.games)) {
    for (const entry of stage.games) {
      const result = parseEntry(entry);

      if (!result) {
        continue;
      }

      existingGamesById.set(result.id, result);
      existingGamesBySgf.set(result.sgf, result);
      previousEntries.push(entry);
    }
  }

  const currentSgfPaths = new Set(sgfPaths);
  const existingValidSgfs = new Set([...existingGamesBySgf.keys()].filter((p) => currentSgfPaths.has(p)));
  const pathsToMatch = force ? sgfPaths : sgfPaths.filter((p) => !existingValidSgfs.has(p));
  const sgfInfos = await loadSgfInfos(sgfDir, pathsToMatch, strict);

  const { matchedEntries, matchedSgfs, unmatchedSgfs, unmatchedEntries, removedEntries } = matchImplicitSgfs({
    sgfInfos,
    playersMap,
    gamesMap,
    existingGamesById,
    existingGamesBySgf,
    currentSgfPaths,
    force,
  });

  return {
    previousEntries,
    reusedEntries: force
      ? []
      : previousEntries.filter((entry) => {
          const parsed = parseEntry(entry);
          return parsed ? existingValidSgfs.has(parsed.sgf) : false;
        }),
    matchedEntries,
    removedEntries,
    unmatchedEntries,
    totalSgfs: sgfPaths.length,
    claimedSgfs: [...new Set([...existingValidSgfs, ...matchedSgfs, ...unmatchedSgfs])],
  };
}

export function matchImplicitSgfs({
  sgfInfos,
  playersMap,
  gamesMap,
  existingGamesById,
  existingGamesBySgf,
  currentSgfPaths,
  force,
}: {
  sgfInfos: SgfInfo[];
  playersMap: ImplicitLookup;
  gamesMap: Map<string, H9GameRecord>;
  existingGamesById: Map<string, ParsedGameEntry>;
  existingGamesBySgf: Map<string, ParsedGameEntry>;
  currentSgfPaths: Set<string>;
  force: boolean;
}): {
  matchedEntries: string[];
  removedEntries: RemovedEntry[];
  unmatchedEntries: UnmatchedEntry[];
  matchedSgfs: string[];
  unmatchedSgfs: string[];
} {
  const candidates: ImplicitCandidate[] = [];
  const matchedEntries: string[] = [];
  const removedEntries: RemovedEntry[] = [];
  const matchedSgfs: string[] = [];
  const unmatchedEntries: UnmatchedEntry[] = [];
  const unmatchedSgfs: string[] = [];
  const removedLocalIds = new Set<string>();

  for (const sgf of sgfInfos) {
    const result = resolveSgfLookup(sgf, playersMap);
    const places = {
      blackPlace: result.black,
      whitePlace: result.white,
    };
    const precheckReasons = buildCommonUnmatchedReasons(sgf, result);

    if (precheckReasons.length > 0) {
      unmatchedEntries.push(buildImplicitUnmatchedEntry(sgf, places, existingGamesBySgf, precheckReasons));
      unmatchedSgfs.push(sgf.path);
      continue;
    }

    const localId = resolveLocalId(sgf, getSgfRound(sgf), playersMap, gamesMap);

    if (!localId) {
      unmatchedEntries.push(buildImplicitUnmatchedEntry(sgf, places, existingGamesBySgf, ['no matching game']));
      unmatchedSgfs.push(sgf.path);
      continue;
    }

    const h9Record = gamesMap.get(localId);

    if (!h9Record) {
      console.warn(`  Warning: cannot find H9 record for ${localId}: ${sgf.path}`);
      unmatchedEntries.push(buildImplicitUnmatchedEntry(sgf, places, existingGamesBySgf, ['no matching game']));
      unmatchedSgfs.push(sgf.path);
      continue;
    }

    const yamlGame = existingGamesById.get(localId);

    if (sgf.sgfOgs && yamlGame?.props?.ogs && sgf.sgfOgs !== yamlGame.props.ogs) {
      unmatchedEntries.push(buildImplicitUnmatchedEntry(sgf, places, existingGamesBySgf, [OGS_CONFLICT_REASON]));
      unmatchedSgfs.push(sgf.path);
      continue;
    }

    if (yamlGame && currentSgfPaths.has(yamlGame.sgf) && !force) {
      unmatchedEntries.push(
        buildImplicitUnmatchedEntry(sgf, places, existingGamesBySgf, [MATCHING_GAME_ALREADY_HAS_SGF_REASON])
      );
      unmatchedSgfs.push(sgf.path);
      continue;
    }

    if (!verifyColors(h9Record, places)) {
      console.warn(
        `  Warning: color mismatch for ${sgf.path} — H9 says place ${h9Record.homePlace} played ${h9Record.homeColor}, SGF disagrees`
      );
      unmatchedEntries.push(buildImplicitUnmatchedEntry(sgf, places, existingGamesBySgf, ['no matching game']));
      unmatchedSgfs.push(sgf.path);
      continue;
    }

    candidates.push({ sgf, localId, h9Record, places, props: yamlGame?.props });
  }

  const duplicateLocalIds = findDuplicateKeys(candidates.map((candidate) => ({ key: candidate.localId })));

  for (const candidate of candidates) {
    if (duplicateLocalIds.has(candidate.localId)) {
      unmatchedEntries.push(
        buildImplicitUnmatchedEntry(candidate.sgf, candidate.places, existingGamesBySgf, [
          MATCHES_SAME_GAME_AS_OTHER_FILE_REASON,
        ])
      );
      unmatchedSgfs.push(candidate.sgf.path);
      continue;
    }

    const matchedEntry = buildSgfEntryString(
      buildImplicitMatchResult(candidate.sgf, candidate.places, candidate.props, candidate.h9Record)
    );
    const yamlGame = existingGamesById.get(candidate.localId);

    if (yamlGame && !currentSgfPaths.has(yamlGame.sgf) && yamlGame.sgf !== candidate.sgf.path) {
      removedEntries.push({
        previousSgf: yamlGame.sgf,
        entry: yamlGame.raw,
      });
      removedLocalIds.add(candidate.localId);
    }

    matchedEntries.push(matchedEntry);
    matchedSgfs.push(candidate.sgf.path);
  }

  for (const [localId, yamlGame] of existingGamesById) {
    if (!currentSgfPaths.has(yamlGame.sgf) && !removedLocalIds.has(localId)) {
      removedEntries.push({
        previousSgf: yamlGame.sgf,
        entry: yamlGame.raw,
      });
    }
  }

  return {
    matchedEntries,
    removedEntries,
    matchedSgfs,
    unmatchedEntries,
    unmatchedSgfs,
  };
}

function parseEntry(entry: string): ParsedGameEntry | null {
  const gameMatch = entry.match(GAME_REGEX);

  if (!gameMatch) {
    return null;
  }

  const { home, away, props } = gameMatch.groups!;
  const parsedProps = parseProps(props);

  if (isNaN(Number(home)) || isNaN(Number(away)) || !parsedProps.sgf) {
    return null;
  }

  const { round, sgf, ...restProps } = parsedProps;

  return {
    id: buildLocalGameId(Number(home), Number(away), round ? Number(round) : (parseFilename(sgf).round ?? undefined)),
    raw: entry,
    sgf,
    props: restProps,
  };
}

export function buildPlayersMap(results: H9Player[], eventPlayers: EventPlayer[] = []): ImplicitLookup {
  const lookup: ImplicitLookup = new Map();

  for (const player of results) {
    const fullName = `${player.name} ${player.surname}`;
    const reversedName = `${player.surname} ${player.name}`;

    registerLookupEntry(lookup, fullName, player.place);
    registerLookupEntry(lookup, reversedName, player.place);

    for (const part of fullName.split(' ')) {
      registerLookupEntry(lookup, part, player.place, false);
    }
  }

  for (const player of results) {
    const eventPlayer = findEventPlayer(player, eventPlayers);

    if (!eventPlayer) {
      continue;
    }

    for (const alias of [
      eventPlayer.name,
      ...(eventPlayer.original ? [eventPlayer.original] : []),
      ...eventPlayer.nickname,
    ]) {
      registerLookupEntry(lookup, alias, player.place);
    }
  }

  return lookup;
}

export function buildGamesMap(results: H9Player[]): Map<string, H9GameRecord> {
  const map = new Map<string, H9GameRecord>();

  for (const player of results) {
    for (const game of player.games) {
      if (!game) {
        continue;
      }

      const myPlace = player.place;
      const opponentPlace = game.opponent;
      const myColor: Color = game.color;
      const opponentColor: Color = flipColor(game.color);
      const localId = buildLocalGameId(myPlace, opponentPlace, game.round);

      if (map.has(localId)) {
        continue;
      }

      const isHomePlayer = !myColor || myColor === 'black';

      let winnerPlace: number | null;
      if (game.result === '+') {
        winnerPlace = myPlace;
      } else if (game.result === '-') {
        winnerPlace = opponentPlace;
      } else {
        winnerPlace = null;
      }

      map.set(localId, {
        homePlace: isHomePlayer ? myPlace : opponentPlace,
        awayPlace: isHomePlayer ? opponentPlace : myPlace,
        round: game.round,
        winnerPlace,
        homeColor: isHomePlayer ? myColor : opponentColor,
        winnerColor: winnerPlace === null ? undefined : winnerPlace === myPlace ? myColor : opponentColor,
      });
    }
  }

  return map;
}

function buildImplicitUnmatchedEntry(
  sgf: SgfInfo,
  places: SgfPlaces,
  yamlGames: Map<string, ParsedGameEntry>,
  reasons: string[]
): UnmatchedEntry {
  return {
    filename: sgf.path,
    line: buildSgfEntryString(buildImplicitMatchResult(sgf, places, yamlGames.get(sgf.path)?.props)),
    reasons,
  };
}

function buildImplicitMatchResult(
  sgf: SgfInfo,
  places: SgfPlaces,
  props?: Record<string, string>,
  h9Record?: H9GameRecord
): SgfMatchResult {
  const black = places.blackPlace ?? h9Record?.homePlace ?? UNKNOWN_PLACE;
  const white =
    places.whitePlace ??
    (h9Record && black === h9Record.homePlace ? h9Record.awayPlace : h9Record?.homePlace) ??
    UNKNOWN_PLACE;
  let { winnerPlace, resultStr } = formatSgfWinner(sgf, places);

  if (resultStr === null && h9Record?.winnerPlace === null) {
    winnerPlace = null;
    resultStr = JIGO;
  }

  if (resultStr === null && h9Record?.winnerPlace !== null && h9Record?.winnerPlace !== undefined) {
    winnerPlace = h9Record.winnerPlace;

    const resultColor = getSgfResultColor(winnerPlace, places) ?? getH9ResultColor(h9Record.winnerColor);

    if (resultColor) {
      resultStr = `${resultColor}+?`;
    }
  }

  const round = h9Record?.round ?? getSgfRound(sgf);
  const targetProps: Record<string, string | undefined> = {
    ...props,
    ogs: sgf.sgfOgs ?? props?.ogs,
    round: typeof round === 'number' ? String(round) : props?.round,
  };

  return {
    black,
    white,
    winner: winnerPlace,
    result: resultStr,
    sgf: sgf.path,
    props: targetProps,
  };
}

function resolveLocalId(
  sgf: SgfInfo,
  round: number | null,
  playersMap: ImplicitLookup,
  h9gamesMap: Map<string, H9GameRecord>
): string | null {
  const places =
    resolveLocalIdPlaces(playersMap, sgf.sgfBlackName, sgf.sgfWhiteName) ??
    resolveLocalIdPlaces(playersMap, sgf.filenameBlackName, sgf.filenameWhiteName);

  if (!places) {
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

function resolveLocalIdPlaces(
  playersMap: ImplicitLookup,
  blackName: string | null,
  whiteName: string | null
): [blackPlace: number, whitePlace: number] | null {
  const blackPlace = lookupPlayerId(playersMap, blackName);
  const whitePlace = lookupPlayerId(playersMap, whiteName);

  return blackPlace !== null && whitePlace !== null ? [blackPlace, whitePlace] : null;
}

function findEventPlayer(player: H9Player, eventPlayers: EventPlayer[]): EventPlayer | undefined {
  if (player.egd) {
    const byEgd = eventPlayers.find((eventPlayer) => eventPlayer.egd === player.egd);

    if (byEgd) {
      return byEgd;
    }
  }

  const fullName = normalizePlayerName(`${player.name} ${player.surname}`);
  const reversedName = normalizePlayerName(`${player.surname} ${player.name}`);

  return eventPlayers.find((eventPlayer) =>
    [eventPlayer.name, ...(eventPlayer.original ? [eventPlayer.original] : []), ...eventPlayer.nickname].some(
      (name) => {
        const normalized = normalizePlayerName(name);
        return normalized === fullName || normalized === reversedName;
      }
    )
  );
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

function getSgfResultColor(place: number, sgfPlaces: SgfPlaces): 'B' | 'W' | null {
  if (sgfPlaces.blackPlace === place) {
    return 'B';
  }

  if (sgfPlaces.whitePlace === place) {
    return 'W';
  }

  return null;
}

function getH9ResultColor(color: Color): 'B' | 'W' | null {
  if (color === 'black') {
    return 'B';
  }

  if (color === 'white') {
    return 'W';
  }

  return null;
}
