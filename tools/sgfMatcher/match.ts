import { hasSgfFilenameSpaces } from './sgf';
import { type SgfInfo, type SgfPlaces, UNKNOWN_PLACE, type UnknownPlace } from './types';

export const MATCHING_GAME_ALREADY_HAS_SGF_REASON = 'matching game already has sgf';
export const MATCHES_SAME_GAME_AS_OTHER_FILE_REASON = 'matches same game as other file';
export const OGS_CONFLICT_REASON = 'ogs conflict';
export const RESULT_CONFLICT_REASON = 'result conflict';

export type WinnerPart = {
  winnerPlace: number | UnknownPlace;
  resultStr: string | null;
};

export type ResolvedSgfPlayers<T> = {
  black: T | null;
  white: T | null;
};

export type DuplicateCandidate = {
  key: string;
};

export function getSgfRound(sgf: SgfInfo): number | null {
  return sgf.sgfRound ?? sgf.filenameRound;
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

export function buildCommonUnmatchedReasons<T>(sgf: SgfInfo, players: ResolvedSgfPlayers<T>): string[] {
  if (sgf.corrupted) {
    return ['corrupted SGF'];
  }

  const reasons: string[] = [];

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

  const blackReason = buildPlayerNameReason(players.black, sgf.sgfBlackName ?? sgf.filenameBlackName);
  const whiteReason = buildPlayerNameReason(players.white, sgf.sgfWhiteName ?? sgf.filenameWhiteName);

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

export function findDuplicateKeys(candidates: DuplicateCandidate[]): Set<string> {
  const counts = new Map<string, number>();

  for (const { key } of candidates) {
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return new Set([...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key));
}

function buildPlayerNameReason<T>(id: T | null, name: string | null): string | null {
  return id === null && name ? `player "${name}" not found` : null;
}
