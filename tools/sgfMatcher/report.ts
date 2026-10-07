import path from 'node:path';
import type { Logger } from '@tools/sgfMatcher/logger';
import type { StageAnalysisResult, StageResult } from './types';

export function printStageReport(logger: Logger, result: StageAnalysisResult): void {
  const previousEntries = new Set(result.previousEntries);
  const actuallyNewMatches = new Set(result.matchedEntries.filter((e) => !previousEntries.has(e)));

  logger.log(`SGF files found: ${result.totalSgfs}`);
  logger.log(`Previously matched: ${result.previousEntries.length}`);
  logger.log(`Reused entries: ${result.reusedEntries.length}`);

  logger.log(`Rematched: ${result.matchedEntries.length - actuallyNewMatches.size}`);
  for (const entry of result.matchedEntries) {
    if (actuallyNewMatches.has(entry)) {
      continue;
    }

    logger.log(`  ${entry}`);
  }

  logger.log(`Newly matched: ${actuallyNewMatches.size}`, actuallyNewMatches.size > 0);
  for (const entry of actuallyNewMatches) {
    logger.log(`  ${entry}`, true);
  }

  logger.log(`Removed: ${result.removedEntries.length}`, result.removedEntries.length > 0);
  for (const { entry } of result.removedEntries) {
    logger.log(`  ${entry}`, true);
  }

  logger.log(`Failed to match: ${result.unmatchedEntries.length}`, result.unmatchedEntries.length > 0);
  for (const { filename, reasons } of result.unmatchedEntries) {
    logger.error(` ✗ ${filename} — ${reasons.join(', ')}`);
  }
}

export function printSummary(results: StageResult[], eventSgfCount: number, unloadedSgfs: string[]): void {
  let totalMatched = 0;
  let totalFailedToMatch = 0;
  let totalReused = 0;
  let totalRemoved = 0;

  for (const r of results) {
    totalMatched += r.matched;
    totalFailedToMatch += r.unmatched;
    totalReused += r.reused;
    totalRemoved += r.removed;
  }

  const totalUnmatched = unloadedSgfs.length;

  console.log(`=== Summary ===`);

  if (unloadedSgfs.length > 0) {
    const folders = new Map<string, number>();
    for (const sgf of unloadedSgfs) {
      const folder = path.posix.dirname(sgf);
      folders.set(folder, (folders.get(folder) ?? 0) + 1);
    }

    console.log('Unmatched folders:');
    for (const [folder, count] of [...folders].sort(([a], [b]) => a.localeCompare(b))) {
      console.log(` ✗ ${folder}: ${count} SGFs`);
    }
  }

  const unmatchedEntries = results.flatMap((r) => r.unmatchedEntries);

  if (unmatchedEntries.length > 0) {
    console.log('Failed to match games:');

    for (const { filename, reasons } of unmatchedEntries) {
      console.log(` ✗ ${filename} - ${reasons.join(', ')}`);
    }
  }

  console.log(
    `Total: ${eventSgfCount} SGFs, ${totalReused} reused, ${totalMatched} matched, ${totalUnmatched} unmatched, ${totalFailedToMatch} failed to match, ${totalRemoved} removed`
  );
}
