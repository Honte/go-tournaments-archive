import { buildUnmatchedString } from './entries';
import { resolveNames } from './sgf';
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

  if (names.blackName === null && names.whiteName === null) {
    reasons.push('no player names found');
  }

  if (names.blackName && !playerLookup.has(normalizePlayerName(names.blackName))) {
    reasons.push(`player "${names.blackName}" not found`);
  }

  if (names.whiteName && !playerLookup.has(normalizePlayerName(names.whiteName))) {
    reasons.push(`player "${names.whiteName}" not found`);
  }

  return reasons;
}

export function printStageReport(result: StageProcessResult): void {
  console.log(`SGF files found: ${result.totalSgfs}`);
  console.log(`Previously matched: ${result.previousEntries.length}`);
  console.log(`Reused entries: ${result.reusedEntries.length}`);
  console.log(`Newly matched: ${result.matchedEntries.length}`);
  console.log(`Unmatched: ${result.unmatchedEntries.length}`);

  for (const { filename, reasons } of result.unmatchedEntries) {
    console.log(` ✗ ${filename} — ${reasons.join(', ') || 'no matching game'}`);
  }
}

export function printSummary(results: StageResult[]): void {
  if (results.length > 1) {
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
    console.log(
      `Total: ${totalSgfs} SGFs, ${totalReused} reused, ${totalMatched} matched, ${totalUnmatched} unmatched`
    );
  }
}
