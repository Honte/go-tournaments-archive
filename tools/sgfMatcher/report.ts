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
  let totalRemoved = 0;

  for (const r of results) {
    totalSgfs += r.totalSgfs;
    totalMatched += r.matched;
    totalUnmatched += r.unmatched;
    totalReused += r.reused;
    totalRemoved += r.removed;
  }

  console.log(`=== Summary ===`);
  console.log(
    `Total: ${totalSgfs} SGFs, ${totalReused} reused, ${totalMatched} matched, ${totalUnmatched} unmatched, ${totalRemoved} removed`
  );

  const unmatchedEntries = results.flatMap((r) => r.unmatchedEntries);

  if (unmatchedEntries.length > 0) {
    console.log('Unmatched games:');

    for (const { filename, reasons } of unmatchedEntries) {
      console.log(` ✗ ${filename} - ${reasons.join(', ')}`);
    }
  }
}
