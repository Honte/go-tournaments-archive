import type { Logger } from '@tools/sgfMatcher/logger';
import type { StageAnalysisResult, StageResult } from './types';

type StageReportOptions = {
  force: boolean;
  verbose: boolean;
};

export function printStageReport(logger: Logger, result: StageAnalysisResult, options: StageReportOptions): void {
  const previousEntries = new Set(result.previousEntries);

  logger.log(`SGF files found: ${result.totalSgfs}`);
  logger.log(`Previously matched: ${result.previousEntries.length}`);
  logger.log(`Reused entries: ${result.reusedEntries.length}`);
  logger.log(`Newly matched: ${result.matchedEntries.length}`, result.matchedEntries.length > 0);

  for (const entry of result.matchedEntries) {
    logger.log(`  ${entry}`, options.verbose || !options.force || !previousEntries.has(entry));
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
