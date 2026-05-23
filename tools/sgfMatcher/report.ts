import type { Logger } from '@tools/sgfMatcher/logger';
import { buildUnmatchedString } from './entries';
import { hasSgfFilenameSpaces, resolveNames } from './sgf';
import type { ParsedGameEntry, SgfInfo, StageProcessResult, StageResult, UnmatchedEntry } from './types';
import { normalizePlayerName } from './utils';

export function buildUnmatchedEntries(
  unmatchedSgfs: SgfInfo[],
  playersMap: Map<string, number>,
  yamlGames: Map<string, ParsedGameEntry>
): UnmatchedEntry[] {
  return unmatchedSgfs.map((sgf) => ({
    filename: sgf.path,
    line: buildUnmatchedString(sgf, playersMap, yamlGames.get(sgf.path)?.props),
    reasons: buildReasons(sgf, playersMap),
  }));
}

function buildReasons(sgf: SgfInfo, playerLookup: Map<string, number>): string[] {
  if (sgf.corrupted) {
    return ['corrupted SGF'];
  }

  const reasons: string[] = [];
  const names = resolveNames(sgf);

  if (hasSgfFilenameSpaces(sgf.path)) {
    reasons.push('filename contains spaces');
  }

  if (names.blackName === null && names.whiteName === null) {
    reasons.push('no player names found');
  }

  if (names.blackName && !playerLookup.has(normalizePlayerName(names.blackName))) {
    reasons.push(`player "${names.blackName}" not found`);
  }

  if (names.whiteName && !playerLookup.has(normalizePlayerName(names.whiteName))) {
    reasons.push(`player "${names.whiteName}" not found`);
  }

  if (sgf.resultIssue) {
    reasons.push(sgf.resultIssue);
  }

  if (sgf.contentIssue) {
    reasons.push(sgf.contentIssue);
  }

  return reasons.length > 0 ? reasons : ['no matching game'];
}

export function printStageReport(logger: Logger, result: StageProcessResult): void {
  logger.log(`SGF files found: ${result.totalSgfs}`);
  logger.log(`Previously matched: ${result.previousEntries.length}`);
  logger.log(`Reused entries: ${result.reusedEntries.length}`);
  logger.log(`Newly matched: ${result.matchedEntries.length}`);
  logger.log(`Unmatched: ${result.unmatchedEntries.length}`, result.unmatchedEntries.length > 0);

  for (const { filename, reasons } of result.unmatchedEntries) {
    logger.error(` ✗ ${filename} — ${reasons.join(', ')}`);
  }
}

export function printSummary(results: StageResult[]): void {
  let totalSgfs = 0;
  let totalMatched = 0;
  let totalUnmatched = 0;
  let totalReused = 0;

  for (const r of results) {
    totalSgfs += r.totalSgfs;
    totalMatched += r.matched;
    totalUnmatched += r.unmatched;
    totalReused += r.reused;
  }

  console.log(`=== Summary ===`);
  console.log(`Total: ${totalSgfs} SGFs, ${totalReused} reused, ${totalMatched} matched, ${totalUnmatched} unmatched`);

  const unmatchedEntries = results.flatMap((r) => r.unmatchedEntries);

  if (unmatchedEntries.length > 0) {
    console.log('Unmatched games:');

    for (const { filename, reasons } of unmatchedEntries) {
      console.log(` ✗ ${filename} - ${reasons.join(', ')}`);
    }
  }
}
