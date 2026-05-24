import EVENT from '@event';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { parseDocument } from 'yaml';
import type { InputTournament } from '@/schema/input';
import { readCliParams } from '@tools/cli';
import { createLogger } from '@tools/sgfMatcher/logger';
import { printDryRunReport, printStageReport, printSummary } from './report';
import { findSgfs } from './sgf';
import { processStage } from './stage';
import type { StageResult } from './types';
import { updateYamlDoc } from './yaml';

const {
  dry,
  force,
  strict,
  year: yearFilter,
  verbose,
} = readCliParams({
  year: { type: 'string', short: 'y' },
  dry: { type: 'boolean', default: false, short: 'd' },
  force: { type: 'boolean', default: false, short: 'f' },
  strict: { type: 'boolean', default: false, short: 's' },
  verbose: { type: 'boolean', default: false, short: 'v' },
});

const DATA_DIR = `events/${EVENT}/data`;
const SGF_DIR = `events/${EVENT}/sgf`;
const results: StageResult[] = [];

if (dry) {
  console.log('== DRY RUN ==');
}

const yamlFiles = await fg.glob(`${DATA_DIR}/*.yml`);

if (!yamlFiles.length) {
  console.log(`No YAML files found in ${DATA_DIR}`);
  process.exit(0);
}

for (const yamlPath of yamlFiles.sort()) {
  const year = parseInt(path.parse(yamlPath).name, 10);

  if (isNaN(year) || (yearFilter && year !== Number(yearFilter))) {
    continue;
  }

  const logger = createLogger(`=== ${EVENT.toUpperCase()} ${year} ===`);
  const yamlContent = await readFile(yamlPath, 'utf-8');
  const doc = parseDocument(yamlContent);
  const json = doc.toJSON() as InputTournament;
  const claimedSgfs = new Set<string>();

  let yamlModified = false;

  for (const [stageIndex, stage] of json.stages.entries()) {
    const allSgfPaths = await findSgfs(
      SGF_DIR,
      stage.type === 'tournament' ? (stage.dir ?? String(year)) : String(year)
    );
    const sgfPaths = allSgfPaths.filter((path) => !claimedSgfs.has(path));

    const stageResult = await processStage({
      tournament: json,
      stage,
      sgfPaths,
      dataDir: DATA_DIR,
      sgfDir: SGF_DIR,
      force,
      strict,
    });

    if (!stageResult.totalSgfs && !stageResult.previousEntries.length) {
      logger.log('No sgf files found');
      continue;
    }

    printStageReport(logger, stageResult);
    printDryRunReport(logger, stageResult, dry);

    if (!dry) {
      yamlModified = updateYamlDoc(doc, stageIndex, stageResult) || yamlModified;
    }

    for (const sgf of stageResult.claimedSgfs) {
      claimedSgfs.add(sgf);
    }

    results.push({
      year,
      reused: stageResult.reusedEntries.length,
      matched: stageResult.matchedEntries.length,
      unmatched: stageResult.unmatchedEntries.length,
      updated: stageResult.updatedEntries.length,
      removed: stageResult.removedEntries.length,
      totalSgfs: stageResult.totalSgfs,
      unmatchedEntries: stageResult.unmatchedEntries,
    });
  }

  if (yamlModified) {
    await writeFile(yamlPath, doc.toString({ lineWidth: 0 }), 'utf-8');
    logger.log(`Written to ${yamlPath}`);
  }

  logger.print(verbose);
}

printSummary(results);

if (dry) {
  console.log('== DRY RUN ==');
}
