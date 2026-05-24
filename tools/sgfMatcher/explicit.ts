import type {
  InputFinalStage,
  InputLadderTableStage,
  InputLeagueStage,
  InputRoundRobinTableStage,
  InputTournament,
} from '@/schema/input';
import { GAME_REGEX } from '@/data/games';
import { getPlayerHash, getPlayerSlug, parsePlayers } from '@/data/players';
import { formatSgfWinner } from './match';
import { hasSgfFilenameSpaces, loadSgfInfos, parseFilename } from './sgf';
import type { InlineGameUpdate, SgfInfo, StageProcessResult, UnmatchedEntry } from './types';
import { UNKNOWN_PLACE } from './types';
import { normalizePlayerName } from './utils';

type ExplicitStage = InputLeagueStage | InputLadderTableStage | InputRoundRobinTableStage | InputFinalStage;

type ExplicitGameEntry = {
  path: (string | number)[];
  raw: string;
  home: string;
  away: string;
  winner: string;
  round: number | null;
  index: number;
  sgf: string | null;
};

type ExplicitPlayerIds = {
  blackId: string | null;
  whiteId: string | null;
};

const SGF_REGEX = /\bsgf:(\S+)/;

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
}): Promise<StageProcessResult> {
  const playersMap = buildYamlPlayersMap(tournament.players);
  const entries = collectExplicitEntries(stage);
  const previousEntries = entries.filter((entry) => entry.sgf).map((entry) => entry.raw);
  const existingSgfs = new Set(entries.flatMap((entry) => (entry.sgf ? [entry.sgf] : [])));
  const stageSgfPaths = sgfPaths.filter((path) => isSgfRelevantToStage(stage, path));
  const pathsToMatch = force ? stageSgfPaths : stageSgfPaths.filter((path) => !existingSgfs.has(path));
  const sgfInfos = await loadSgfInfos(sgfDir, pathsToMatch, strict);
  const matchedEntries: string[] = [];
  const unmatchedEntries: UnmatchedEntry[] = [];
  const inlineUpdates: InlineGameUpdate[] = [];
  const claimedSgfs = new Set(existingSgfs);
  const matchedEntryPaths = new Set<string>();

  for (const sgf of sgfInfos) {
    claimedSgfs.add(sgf.path);

    const precheckReasons = getExplicitUnmatchedReasons(sgf, playersMap);
    if (precheckReasons.length > 0) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playersMap, precheckReasons));
      continue;
    }

    const metadataConflictReason = getMetadataConflictReason(sgf, playersMap);

    if (metadataConflictReason) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playersMap, [metadataConflictReason]));
      continue;
    }

    const playerIds = resolveExplicitSgfPlayers(sgf, playersMap);

    if (!playerIds.blackId || !playerIds.whiteId) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playersMap));
      continue;
    }

    const candidates = findMatchingEntries(sgf, playerIds, entries, force);

    if (candidates.length !== 1) {
      unmatchedEntries.push(
        buildExplicitUnmatchedEntry(sgf, playersMap, [
          candidates.length > 1 ? 'multiple matching games' : 'no matching game',
        ])
      );
      continue;
    }

    const entry = candidates[0];
    const entryKey = entry.path.join('.');

    if (matchedEntryPaths.has(entryKey)) {
      unmatchedEntries.push(buildExplicitUnmatchedEntry(sgf, playersMap, ['duplicate match']));
      continue;
    }

    const value = updateGameSgf(entry, sgf.path);
    inlineUpdates.push({ path: entry.path, value });
    matchedEntries.push(value);
    matchedEntryPaths.add(entryKey);
  }

  return {
    previousEntries,
    reusedEntries: force ? [] : previousEntries,
    matchedEntries,
    unmatchedEntries,
    totalSgfs: stageSgfPaths.length,
    claimedSgfs: [...claimedSgfs],
    inlineUpdates,
  };
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

  const { home, away, winner, props } = match.groups!;

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
    round,
    index,
    sgf: sgfMatch?.[1] ?? null,
  };
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
  entries: ExplicitGameEntry[],
  force: boolean
): ExplicitGameEntry[] {
  let candidates = entries.filter((entry) => {
    if (entry.sgf && !force) {
      return false;
    }

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

function updateGameSgf(entry: ExplicitGameEntry, sgfPath: string): string {
  const sgfProp = `sgf:${sgfPath}`;

  if (entry.sgf) {
    return entry.raw.replace(SGF_REGEX, sgfProp);
  }

  return `${entry.raw} ${sgfProp}`;
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

function buildExplicitUnmatchedEntry(
  sgf: SgfInfo,
  playerLookup: Map<string, string>,
  fallbackReasons: string[] = []
): UnmatchedEntry {
  const reasons = getExplicitUnmatchedReasons(sgf, playerLookup);

  return {
    filename: sgf.path,
    line: buildExplicitUnmatchedString(sgf, playerLookup),
    reasons: reasons.length > 0 ? reasons : fallbackReasons.length > 0 ? fallbackReasons : ['no matching game'],
  };
}

function buildExplicitUnmatchedString(sgf: SgfInfo, playerLookup: Map<string, string>): string {
  const players = resolveExplicitSgfPlayers(sgf, playerLookup);
  const { winnerPlace, resultStr } = formatSgfWinner(sgf, {
    blackPlace: players.blackId ? 1 : null,
    whitePlace: players.whiteId ? 2 : null,
  });
  const black = players.blackId ?? UNKNOWN_PLACE;
  const white = players.whiteId ?? UNKNOWN_PLACE;
  const winner = winnerPlace === 1 ? black : winnerPlace === 2 ? white : UNKNOWN_PLACE;
  const winnerPart = resultStr ? `${winner}:${resultStr}` : String(winner);
  const round = getExplicitStageRound(sgf);
  const roundPart = round !== null ? ` round:${round}` : '';

  return `${black}-${white} ${winnerPart}${roundPart} sgf:${sgf.path}`.trim();
}

function getExplicitUnmatchedReasons(sgf: SgfInfo, playerLookup: Map<string, string>): string[] {
  if (sgf.corrupted) {
    return ['corrupted SGF'];
  }

  const reasons: string[] = [];
  const players = resolveExplicitSgfPlayers(sgf, playerLookup);

  if (hasSgfFilenameSpaces(sgf.path)) {
    reasons.push('filename contains spaces');
  }

  if (
    sgf.sgfBlackName === null &&
    sgf.sgfWhiteName === null &&
    sgf.filenameBlackName === null &&
    sgf.filenameWhiteName === null
  ) {
    reasons.push('no player names found');
  }

  const blackReason = buildPlayerNameReason(players.blackId, sgf.sgfBlackName ?? sgf.filenameBlackName);
  const whiteReason = buildPlayerNameReason(players.whiteId, sgf.sgfWhiteName ?? sgf.filenameWhiteName);

  if (blackReason) {
    reasons.push(blackReason);
  }

  if (whiteReason) {
    reasons.push(whiteReason);
  }

  if (sgf.resultIssue) {
    reasons.push(sgf.resultIssue);
  }

  if (sgf.contentIssue) {
    reasons.push(sgf.contentIssue);
  }

  return reasons;
}

function buildPlayerNameReason(id: string | null, name: string | null): string | null {
  return id === null && name ? `player "${name}" not found` : null;
}
