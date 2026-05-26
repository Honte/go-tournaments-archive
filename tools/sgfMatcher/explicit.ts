import type {
  InputFinalStage,
  InputLadderTableStage,
  InputLeagueStage,
  InputRoundRobinTableStage,
  InputTournament,
} from '@/schema/input';
import { GAME_REGEX } from '@/data/games';
import { getPlayerHash, getPlayerSlug, parsePlayers } from '@/data/players';
import { buildEntryWithoutSgf, buildSgfEntryString, type SgfMatchResult } from './entries';
import {
  buildCommonUnmatchedReasons,
  findDuplicateKeys,
  formatSgfWinner,
  MATCHES_SAME_GAME_AS_OTHER_FILE_REASON,
  MATCHING_GAME_ALREADY_HAS_SGF_REASON,
} from './match';
import { loadSgfInfos, parseFilename } from './sgf';
import {
  type InlineGameUpdate,
  type RemovedEntry,
  type SgfInfo,
  type StageAnalysisResult,
  UNKNOWN_PLACE,
  type UnmatchedEntry,
} from './types';
import { normalizePlayerName } from './utils';

type ExplicitStage = InputLeagueStage | InputLadderTableStage | InputRoundRobinTableStage | InputFinalStage;

type ExplicitGameEntry = {
  path: (string | number)[];
  raw: string;
  home: string;
  away: string;
  winner: string;
  result: string | null;
  props: string;
  round: number | null;
  index: number;
  sgf: string | null;
};

type ExplicitPlayerIds = {
  blackId: string | null;
  whiteId: string | null;
};

type ExplicitCandidate = {
  sgf: SgfInfo;
  entry: ExplicitGameEntry;
  players: ExplicitPlayerIds;
  entryKey: string;
};

const SGF_REGEX = /\bsgf:(\S+)/;
const RESULT_CONFLICT_REASON = 'result conflict';

export async function processExplicitStage({
  tournament,
  stage,
  sgfPaths,
  sgfDir,
  force,
  strict,
}: {
  tournament: InputTournament;
  stage: ExplicitStage;
  sgfPaths: string[];
  sgfDir: string;
  force: boolean;
  strict: boolean;
}): Promise<StageAnalysisResult> {
  const pathsToMatch = getExplicitPathsToMatch(stage, sgfPaths, force);
  const sgfInfos = await loadSgfInfos(sgfDir, pathsToMatch, strict);

  return matchExplicitSgfs({ tournament, stage, sgfPaths, sgfInfos, force });
}

export function matchExplicitSgfs({
  tournament,
  stage,
  sgfPaths,
  sgfInfos,
  force,
}: {
  tournament: InputTournament;
  stage: ExplicitStage;
  sgfPaths: string[];
  sgfInfos: SgfInfo[];
  force: boolean;
}): StageAnalysisResult {
  const playersMap = buildYamlPlayersMap(tournament.players);
  const entries = collectExplicitEntries(stage);
  const previousEntries = entries.filter((entry) => entry.sgf).map((entry) => entry.raw);
  const existingSgfs = new Set(entries.flatMap((entry) => (entry.sgf ? [entry.sgf] : [])));
  const stageSgfPaths = sgfPaths.filter((path) => isSgfRelevantToStage(stage, path));
  const currentSgfPaths = new Set(stageSgfPaths);
  const existingValidSgfs = new Set([...existingSgfs].filter((path) => currentSgfPaths.has(path)));
  const matchCandidates: ExplicitCandidate[] = [];
  const matchedEntries: string[] = [];
  const removedEntries: RemovedEntry[] = [];
  const unmatchedEntries: UnmatchedEntry[] = [];
  const inlineUpdates: InlineGameUpdate[] = [];
  const claimedSgfs = new Set(existingValidSgfs);
  const clearedEntryPaths = new Set<string>();
  const removedEntryPaths = new Set<string>();

  for (const sgf of sgfInfos) {
    claimedSgfs.add(sgf.path);
    const playerIds = resolveExplicitSgfPlayers(sgf, playersMap);

    const precheckReasons = getExplicitUnmatchedReasons(sgf, playerIds);
    if (precheckReasons.length > 0) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playerIds, precheckReasons));
      continue;
    }

    const metadataConflictReason = getMetadataConflictReason(sgf, playersMap);

    if (metadataConflictReason) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playerIds, [metadataConflictReason]));
      continue;
    }

    const candidates = findMatchingEntries(sgf, playerIds, entries);

    if (candidates.length !== 1) {
      unmatchedEntries.push(
        buildExplicitUnmatchedEntry(sgf, playerIds, [
          candidates.length > 1 ? 'multiple matching games' : 'no matching game',
        ])
      );
      continue;
    }

    const entry = candidates[0];
    const entryKey = entry.path.join('.');
    const sgfResult = getMatchedExplicitSgfResult(entry, sgf, playerIds);

    if (sgfResult && sgfResult.winner !== entry.winner) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playerIds, [RESULT_CONFLICT_REASON]));
      continue;
    }

    if (entry.sgf && currentSgfPaths.has(entry.sgf) && !force) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playerIds, [MATCHING_GAME_ALREADY_HAS_SGF_REASON]));
      continue;
    }

    matchCandidates.push({ sgf, entry, players: playerIds, entryKey });
  }

  const duplicateEntryKeys = findDuplicateKeys(matchCandidates.map((candidate) => ({ key: candidate.entryKey })));

  for (const candidate of matchCandidates) {
    if (duplicateEntryKeys.has(candidate.entryKey)) {
      unmatchedEntries.push(
        buildExplicitUnmatchedEntry(candidate.sgf, candidate.players, [MATCHES_SAME_GAME_AS_OTHER_FILE_REASON])
      );

      if (
        force &&
        candidate.entry.sgf &&
        currentSgfPaths.has(candidate.entry.sgf) &&
        !clearedEntryPaths.has(candidate.entryKey)
      ) {
        inlineUpdates.push({ path: candidate.entry.path, value: buildEntryWithoutSgf(candidate.entry.raw) });
        clearedEntryPaths.add(candidate.entryKey);
      }

      continue;
    }

    const value = buildSgfEntryString(buildMatchedExplicitEntry(candidate.entry, candidate.sgf, candidate.players));
    inlineUpdates.push({ path: candidate.entry.path, value });
    matchedEntries.push(value);

    if (
      candidate.entry.sgf &&
      !currentSgfPaths.has(candidate.entry.sgf) &&
      candidate.entry.sgf !== candidate.sgf.path
    ) {
      removedEntries.push({
        previousSgf: candidate.entry.sgf,
        entry: candidate.entry.raw,
      });
      removedEntryPaths.add(candidate.entryKey);
    }
  }

  for (const entry of entries) {
    const entryKey = entry.path.join('.');

    if (
      entry.sgf &&
      !currentSgfPaths.has(entry.sgf) &&
      !removedEntryPaths.has(entryKey) &&
      !clearedEntryPaths.has(entryKey)
    ) {
      const value = buildEntryWithoutSgf(entry.raw);
      inlineUpdates.push({ path: entry.path, value });
      removedEntries.push({ previousSgf: entry.sgf, entry: entry.raw });
      clearedEntryPaths.add(entryKey);
    }
  }

  return {
    previousEntries,
    reusedEntries: force
      ? []
      : entries.filter((entry) => entry.sgf && existingValidSgfs.has(entry.sgf)).map((entry) => entry.raw),
    matchedEntries,
    removedEntries,
    unmatchedEntries,
    totalSgfs: stageSgfPaths.length,
    claimedSgfs: [...claimedSgfs],
    inlineUpdates,
  };
}

function getExplicitPathsToMatch(stage: ExplicitStage, sgfPaths: string[], force: boolean): string[] {
  const entries = collectExplicitEntries(stage);
  const existingSgfs = new Set(entries.flatMap((entry) => (entry.sgf ? [entry.sgf] : [])));
  const stageSgfPaths = sgfPaths.filter((path) => isSgfRelevantToStage(stage, path));
  const currentSgfPaths = new Set(stageSgfPaths);
  const existingValidSgfs = new Set([...existingSgfs].filter((path) => currentSgfPaths.has(path)));

  return force ? stageSgfPaths : stageSgfPaths.filter((path) => !existingValidSgfs.has(path));
}

function isSgfRelevantToStage(stage: ExplicitStage, sgfPath: string): boolean {
  const { stage: filenameStage } = parseFilename(sgfPath);

  if (!filenameStage) {
    return true;
  }

  switch (stage.type) {
    case 'league':
      return filenameStage === 'league';
    case 'ladder-table':
      return filenameStage === 'ladder' || filenameStage === 'playoffs';
    case 'round-robin-table':
      return filenameStage === 'round-robin-table';
    case 'final':
      return filenameStage === 'final';
  }
}

function collectExplicitEntries(stage: ExplicitStage): ExplicitGameEntry[] {
  switch (stage.type) {
    case 'league':
      return collectRoundEntries(stage.rounds, ['rounds']);
    case 'ladder-table':
      return [
        ...collectRoundEntries(stage.rounds, ['rounds']),
        ...collectFlatEntries(stage.playoffs ?? [], ['playoffs'], null),
      ];
    case 'round-robin-table':
    case 'final':
      return collectFlatEntries(stage.games, ['games'], null);
  }
}

function collectRoundEntries(rounds: string[][], basePath: (string | number)[]): ExplicitGameEntry[] {
  return rounds.flatMap((round, roundIndex) => collectFlatEntries(round, [...basePath, roundIndex], roundIndex + 1));
}

function collectFlatEntries(games: string[], basePath: (string | number)[], round: number | null): ExplicitGameEntry[] {
  return games.flatMap((game, index) => {
    const entry = parseExplicitEntry(game, [...basePath, index], round, index + 1);

    return entry ? [entry] : [];
  });
}

function parseExplicitEntry(
  raw: string,
  path: (string | number)[],
  round: number | null,
  index: number
): ExplicitGameEntry | null {
  const match = raw.match(GAME_REGEX);

  if (!match) {
    return null;
  }

  const { home, away, winner, result, props } = match.groups!;

  if ([home, away, winner].some((id) => id.toLowerCase() === 'bye')) {
    return null;
  }

  const sgfMatch = props?.match(SGF_REGEX);

  return {
    path,
    raw,
    home,
    away,
    winner,
    result: result ?? null,
    props: buildEntryWithoutSgf(props ?? ''),
    round,
    index,
    sgf: sgfMatch?.[1] ?? null,
  };
}

function buildMatchedExplicitEntry(entry: ExplicitGameEntry, sgf: SgfInfo, players: ExplicitPlayerIds): SgfMatchResult {
  const sgfResult = getMatchedExplicitSgfResult(entry, sgf, players);

  return {
    black: entry.home,
    white: entry.away,
    winner: entry.winner,
    result: sgfResult?.result ?? entry.result,
    round: null,
    sgf: sgf.path,
    props: entry.props,
  };
}

function getMatchedExplicitSgfResult(
  entry: ExplicitGameEntry,
  sgf: SgfInfo,
  players: ExplicitPlayerIds
): { winner: string; result: string } | null {
  if (!sgf.cleanResult || (sgf.cleanResult[0] !== 'B' && sgf.cleanResult[0] !== 'W')) {
    return null;
  }

  if (!sgf.sgfBlackName && !sgf.sgfWhiteName) {
    return { winner: entry.winner, result: sgf.cleanResult.replace(/\+$/, '') };
  }

  const winner = sgf.cleanResult[0] === 'B' ? players.blackId : players.whiteId;

  return winner ? { winner, result: sgf.cleanResult.replace(/\+$/, '') } : null;
}

function buildYamlPlayersMap(players: InputTournament['players']): Map<string, string> {
  const lookup = new Map<string, string>();
  const parsedPlayers = parsePlayers(players ?? {});

  for (const [id, player] of Object.entries(parsedPlayers)) {
    const hash = getPlayerHash(player.name);

    registerPlayerName(lookup, id, id);
    registerPlayerName(lookup, player.name, id);
    registerPlayerName(lookup, hash, id);
    registerPlayerName(lookup, getPlayerSlug(hash), id);
  }

  return lookup;
}

function registerPlayerName(lookup: Map<string, string>, name: string, id: string): void {
  const normalized = normalizePlayerName(name);
  const existing = lookup.get(normalized);

  if (!existing) {
    lookup.set(normalized, id);
  } else if (existing !== id) {
    console.warn(`  Warning: skipped ambiguous normalized player "${normalized}" (${existing} and ${id})`);
  }
}

function findMatchingEntries(
  sgf: SgfInfo,
  playerIds: ExplicitPlayerIds,
  entries: ExplicitGameEntry[]
): ExplicitGameEntry[] {
  let candidates = entries.filter((entry) => {
    return (
      (entry.home === playerIds.blackId && entry.away === playerIds.whiteId) ||
      (entry.home === playerIds.whiteId && entry.away === playerIds.blackId)
    );
  });

  const stageRound = getExplicitStageRound(sgf);

  if (stageRound !== null) {
    const roundCandidates = candidates.filter((entry) => entry.round === stageRound);

    if (roundCandidates.length > 0) {
      candidates = roundCandidates;
    }
  }

  if (sgf.filenameRound !== null) {
    const indexCandidates = candidates.filter((entry) => entry.index === sgf.filenameRound);

    if (indexCandidates.length > 0) {
      candidates = indexCandidates;
    }
  }

  return candidates;
}

function resolveExplicitSgfPlayers(sgf: SgfInfo, playerLookup: Map<string, string>): ExplicitPlayerIds {
  return {
    blackId: lookupPlayerId(sgf.sgfBlackName, playerLookup) ?? lookupPlayerId(sgf.filenameBlackName, playerLookup),
    whiteId: lookupPlayerId(sgf.sgfWhiteName, playerLookup) ?? lookupPlayerId(sgf.filenameWhiteName, playerLookup),
  };
}

function resolveExplicitPlayerNames(
  blackName: string | null,
  whiteName: string | null,
  playerLookup: Map<string, string>
): ExplicitPlayerIds {
  return {
    blackId: lookupPlayerId(blackName, playerLookup),
    whiteId: lookupPlayerId(whiteName, playerLookup),
  };
}

function getMetadataConflictReason(sgf: SgfInfo, playerLookup: Map<string, string>): string | null {
  const metadata = resolveExplicitPlayerNames(sgf.sgfBlackName, sgf.sgfWhiteName, playerLookup);
  const filename = resolveExplicitPlayerNames(sgf.filenameBlackName, sgf.filenameWhiteName, playerLookup);

  if (!metadata.blackId || !metadata.whiteId || !filename.blackId || !filename.whiteId) {
    return null;
  }

  if (
    (metadata.blackId === filename.blackId && metadata.whiteId === filename.whiteId) ||
    (metadata.blackId === filename.whiteId && metadata.whiteId === filename.blackId)
  ) {
    return null;
  }

  return 'metadata player names conflict with filename';
}

function getExplicitStageRound(sgf: SgfInfo): number | null {
  if (sgf.sgfRound !== null) {
    return sgf.sgfRound;
  }

  return sgf.filenameStage === 'league' || sgf.filenameStage === 'ladder' || sgf.filenameStage === 'round-robin-table'
    ? sgf.filenameRound
    : null;
}

function lookupPlayerId(name: string | null, playerLookup: Map<string, string>): string | null {
  return name ? (playerLookup.get(normalizePlayerName(name)) ?? null) : null;
}

function buildExplicitUnmatchedEntry(sgf: SgfInfo, players: ExplicitPlayerIds, reasons: string[]): UnmatchedEntry {
  return {
    filename: sgf.path,
    line: buildSgfEntryString(buildExplicitMatchResult(sgf, players)),
    reasons,
  };
}

function getExplicitUnmatchedReasons(sgf: SgfInfo, players: ExplicitPlayerIds): string[] {
  return buildCommonUnmatchedReasons(sgf, {
    black: players.blackId,
    white: players.whiteId,
  });
}

function buildExplicitMatchResult(sgf: SgfInfo, players: ExplicitPlayerIds): SgfMatchResult {
  const { winnerPlace, resultStr } = formatSgfWinner(sgf, {
    blackPlace: players.blackId ? 1 : null,
    whitePlace: players.whiteId ? 2 : null,
  });
  const black = players.blackId ?? UNKNOWN_PLACE;
  const white = players.whiteId ?? UNKNOWN_PLACE;

  return {
    black,
    white,
    winner: winnerPlace === 1 ? black : winnerPlace === 2 ? white : UNKNOWN_PLACE,
    result: resultStr,
    round: getExplicitStageRound(sgf),
    sgf: sgf.path,
  };
}
