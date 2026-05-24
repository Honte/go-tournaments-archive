import type { Logger } from '@tools/sgfMatcher/logger';
import type { StageAnalysisResult, StageResult } from './types';

export function printStageReport(logger: Logger, result: StageAnalysisResult): void {
  logger.log(`SGF files found: ${result.totalSgfs}`);
  logger.log(`Previously matched: ${result.previousEntries.length}`);
  logger.log(`Reused entries: ${result.reusedEntries.length}`);
  logger.log(`Newly matched: ${result.matchedEntries.length}`);
  logger.log(`Updated: ${result.updatedEntries.length}`, result.updatedEntries.length > 0);
  logger.log(`Removed: ${result.removedEntries.length}`, result.removedEntries.length > 0);
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
  let totalUpdated = 0;
  let totalRemoved = 0;

  for (const r of results) {
    totalSgfs += r.totalSgfs;
    totalMatched += r.matched;
    totalUnmatched += r.unmatched;
    totalReused += r.reused;
    totalUpdated += r.updated;
    totalRemoved += r.removed;
  }

  console.log(`=== Summary ===`);
  console.log(
    `Total: ${totalSgfs} SGFs, ${totalReused} reused, ${totalMatched} matched, ${totalUnmatched} unmatched, ${totalUpdated} updated, ${totalRemoved} removed`
  );

  const unmatchedEntries = results.flatMap((r) => r.unmatchedEntries);

  if (unmatchedEntries.length > 0) {
    console.log('Unmatched games:');

    for (const { filename, reasons } of unmatchedEntries) {
      console.log(` ✗ ${filename} - ${reasons.join(', ')}`);
    }
  }
}

export function printDryRunReport(logger: Logger, stageResult: StageAnalysisResult, dry: boolean): void {
  if (dry && stageResult.matchedEntries.length > 0) {
    logger.log('Matched entries:');

    for (const entry of stageResult.matchedEntries) {
      logger.log(`  ${entry}`);
    }
  }
}
