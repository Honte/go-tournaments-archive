import type {
  InputFinalStage,
  InputLadderTableStage,
  InputLeagueStage,
  InputRoundRobinTableStage,
  InputTournament,
} from '@/schema/input';
import { JIGO } from '@/libs/games';
import type { EventPlayer } from '@/data/eventPlayers';
import { GAME_REGEX } from '@/data/games';
import { createPlayersHandler, getPlayerHash, getPlayerSlug } from '@/data/players';
import { buildEntryWithoutSgf, buildSgfEntryString, type SgfMatchResult } from './entries';
import {
  type PlayerLookupMap,
  type PlayerLookupResult,
  registerLookupEntry,
  resolvePlayersLookup,
  resolveSgfLookup,
} from './lookup';
import {
  buildCommonUnmatchedReasons,
  findDuplicateKeys,
  formatSgfWinner,
  MATCHES_SAME_GAME_AS_OTHER_FILE_REASON,
  MATCHING_GAME_ALREADY_HAS_SGF_REASON,
  OGS_CONFLICT_REASON,
  RESULT_CONFLICT_REASON,
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
import { parseProps } from './utils';

type ExplicitStage = InputLeagueStage | InputLadderTableStage | InputRoundRobinTableStage | InputFinalStage;
type ExplicitLookup = PlayerLookupMap<string>;
type ExplicitPlayerIds = PlayerLookupResult<string>;

type ExplicitGameEntry = {
  path: (string | number)[];
  raw: string;
  home: string;
  away: string;
  winner: string | null;
  result: string | null;
  props: Record<string, string>;
  round: number | null;
  index: number;
  sgf: string | null;
};

type ExplicitCandidate = {
  sgf: SgfInfo;
  entry: ExplicitGameEntry;
  players: PlayerLookupResult<string>;
  entryKey: string;
};

export async function processExplicitStage({
  tournament,
  stage,
  sgfPaths,
  sgfDir,
  force,
  strict,
  eventPlayers,
}: {
  tournament: InputTournament;
  stage: ExplicitStage;
  sgfPaths: string[];
  sgfDir: string;
  force: boolean;
  strict: boolean;
  eventPlayers: EventPlayer[];
}): Promise<StageAnalysisResult> {
  const pathsToMatch = getExplicitPathsToMatch(stage, sgfPaths, force);
  const sgfInfos = await loadSgfInfos(sgfDir, pathsToMatch, strict);

  return matchExplicitSgfs({ tournament, stage, sgfPaths, sgfInfos, force, eventPlayers });
}

export function matchExplicitSgfs({
  tournament,
  stage,
  sgfPaths,
  sgfInfos,
  force,
  eventPlayers,
}: {
  tournament: InputTournament;
  stage: ExplicitStage;
  sgfPaths: string[];
  sgfInfos: SgfInfo[];
  force: boolean;
  eventPlayers?: EventPlayer[];
}): StageAnalysisResult {
  const playersMap = buildYamlPlayersMap(tournament.players, eventPlayers);
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
    const playerIds = resolveSgfLookup(sgf, playersMap);

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

    if (sgf.sgfOgs && entry.props.ogs && sgf.sgfOgs !== entry.props.ogs) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playerIds, [OGS_CONFLICT_REASON]));
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

  const { home, away, draw, winner, result, props } = match.groups!;

  if ([home, away, winner].some((id) => id?.toLowerCase() === 'bye')) {
    return null;
  }

  const parsedProps = parseProps(props);
  const { sgf, round: _round, ...restProps } = parsedProps;

  return {
    path,
    raw,
    home,
    away,
    winner: draw ? null : winner,
    result: draw ? JIGO : (result ?? null),
    props: restProps,
    round,
    index,
    sgf: sgf ?? null,
  };
}

function buildMatchedExplicitEntry(entry: ExplicitGameEntry, sgf: SgfInfo, players: ExplicitPlayerIds): SgfMatchResult {
  const sgfResult = getMatchedExplicitSgfResult(entry, sgf, players);

  return {
    home: entry.home,
    away: entry.away,
    black: sgf.sgfBlackName && players.black ? players.black : undefined,
    winner: entry.winner,
    result: sgfResult?.result ?? entry.result,
    sgf: sgf.path,
    props: {
      ...entry.props,
      ogs: sgf.sgfOgs ?? entry.props.ogs,
      round: null,
    },
  };
}

function getMatchedExplicitSgfResult(
  entry: ExplicitGameEntry,
  sgf: SgfInfo,
  players: ExplicitPlayerIds
): { winner: string | null; result: string } | null {
  if (sgf.cleanResult === '0') {
    return { winner: null, result: '0' };
  }

  if (!sgf.cleanResult || (sgf.cleanResult[0] !== 'B' && sgf.cleanResult[0] !== 'W')) {
    return null;
  }

  if (!sgf.sgfBlackName && !sgf.sgfWhiteName) {
    return { winner: entry.winner, result: sgf.cleanResult.replace(/\+$/, '') };
  }

  const winner = sgf.cleanResult[0] === 'B' ? players.black : players.white;

  return winner ? { winner, result: sgf.cleanResult.replace(/\+$/, '') } : null;
}

function buildYamlPlayersMap(
  players: InputTournament['players'],
  eventPlayers: EventPlayer[] = []
): PlayerLookupMap<string> {
  const lookup: PlayerLookupMap<string> = new Map();
  const playersHandler = createPlayersHandler(eventPlayers);
  const parsedPlayers = playersHandler.loadJson(players ?? {});

  for (const [id, player] of Object.entries(parsedPlayers)) {
    const playerData = playersHandler.getPlayer(player.id);
    const hash = getPlayerHash(player.name);

    registerLookupEntry(lookup, id, id);
    registerLookupEntry(lookup, player.name, id);
    registerLookupEntry(lookup, hash, id);
    registerLookupEntry(lookup, getPlayerSlug(hash), id);

    for (const part of player.name.split(' ')) {
      registerLookupEntry(lookup, part, id, false);
    }

    if (playerData) {
      const aliases = [
        ...(playerData.displayName ? [playerData.displayName] : []),
        ...(playerData.lastUsedName ? [playerData.lastUsedName] : []),
        ...(playerData.originalName ? [playerData.originalName] : []),
        ...playerData.names,
        ...playerData.nickname,
      ];

      for (const alias of aliases) {
        registerLookupEntry(lookup, alias, id);
      }
    }
  }

  return lookup;
}

function findMatchingEntries(
  sgf: SgfInfo,
  playerIds: ExplicitPlayerIds,
  entries: ExplicitGameEntry[]
): ExplicitGameEntry[] {
  let candidates = entries.filter((entry) => {
    return (
      (entry.home === playerIds.black && entry.away === playerIds.white) ||
      (entry.home === playerIds.white && entry.away === playerIds.black)
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

function getMetadataConflictReason(sgf: SgfInfo, playerLookup: ExplicitLookup): string | null {
  const metadata = resolvePlayersLookup(playerLookup, sgf.sgfBlackName, sgf.sgfWhiteName);
  const filename = resolvePlayersLookup(playerLookup, sgf.filenameBlackName, sgf.filenameWhiteName);

  if (!metadata.black || !metadata.white || !filename.black || !filename.white) {
    return null;
  }

  if (
    (metadata.black === filename.black && metadata.white === filename.white) ||
    (metadata.black === filename.white && metadata.white === filename.black)
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

function buildExplicitUnmatchedEntry(sgf: SgfInfo, players: ExplicitPlayerIds, reasons: string[]): UnmatchedEntry {
  return {
    filename: sgf.path,
    line: buildSgfEntryString(buildExplicitMatchResult(sgf, players)),
    reasons,
  };
}

function getExplicitUnmatchedReasons(sgf: SgfInfo, players: ExplicitPlayerIds): string[] {
  return buildCommonUnmatchedReasons(sgf, {
    black: players.black,
    white: players.white,
  });
}

function buildExplicitMatchResult(sgf: SgfInfo, players: ExplicitPlayerIds): SgfMatchResult {
  const { winnerPlace, resultStr } = formatSgfWinner(sgf, {
    blackPlace: players.black ? 1 : null,
    whitePlace: players.white ? 2 : null,
  });
  const black = players.black ?? UNKNOWN_PLACE;
  const white = players.white ?? UNKNOWN_PLACE;

  return {
    home: black,
    away: white,
    black: sgf.sgfBlackName && players.black ? players.black : undefined,
    winner: winnerPlace === null ? null : winnerPlace === 1 ? black : winnerPlace === 2 ? white : UNKNOWN_PLACE,
    result: resultStr,
    sgf: sgf.path,
    props: {
      ogs: sgf.sgfOgs,
    },
  };
}
