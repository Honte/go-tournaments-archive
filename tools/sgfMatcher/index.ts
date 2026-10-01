import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { parseDocument } from 'yaml';
import type { InputTournament } from '@/schema/input';
import { loadEventDefinition } from '@/events';
import { readCliParams } from '@tools/cli';
import { createLogger } from '@tools/sgfMatcher/logger';
import { readEventPlayersFile } from '@/data/eventPlayers';
import { printStageReport, printSummary } from './report';
import { findSgfs } from './sgf';
import { processStage } from './stage';
import type { StageResult } from './types';
import { updateYamlDoc } from './yaml';

const {
  event,
  dry,
  force,
  strict,
  year: yearFilter,
  verbose,
} = readCliParams({
  event: { type: 'string', short: 'e', positional: true, default: process.env.EVENT },
  year: { type: 'string', short: 'y' },
  dry: { type: 'boolean', default: false, short: 'd' },
  force: { type: 'boolean', default: false, short: 'f' },
  strict: { type: 'boolean', default: false, short: 's' },
  verbose: { type: 'boolean', default: false, short: 'v' },
});

if (dry) {
  console.log('== DRY RUN ==');
}

const eventIds = event
  ? [event]
  : (await fg.glob('events/*', { onlyDirectories: true })).sort().map((dir) => path.posix.basename(dir));

for (const [index, eventId] of eventIds.entries()) {
  if (index > 0) {
    console.log();
  }

  if (eventIds.length > 1) {
    console.log(`=== EVENT: ${eventId.toUpperCase()} ===`);
  }
  await processEvent(eventId);
}

if (dry) {
  console.log('== DRY RUN ==');
}

async function processEvent(event: string) {
  const DATA_DIR = `events/${event}/data`;
  const SGF_DIR = `events/${event}/sgf`;
  const eventDefinition = await loadEventDefinition(event);
const eventPlayers = await readEventPlayersFile(event);
  const results: StageResult[] = [];
  const loadedSgfs = new Set<string>();

  const yamlFiles = await fg.glob(`${DATA_DIR}/*.yml`);

  if (!yamlFiles.length) {
    console.log(`No YAML files found in ${DATA_DIR}`);
    return;
  }

  for (const yamlPath of yamlFiles.sort()) {
    const year = parseInt(path.parse(yamlPath).name, 10);

    if (isNaN(year) || (yearFilter && year !== Number(yearFilter))) {
      continue;
    }

    const logger = createLogger(`=== ${event.toUpperCase()} ${year} ===`);
    const yamlContent = await readFile(yamlPath, 'utf-8');
    const doc = parseDocument(yamlContent);
    const json = doc.toJSON() as InputTournament;
    const claimedSgfs = new Set<string>();

    let yamlModified = false;

    if (!json.stages?.length) {
      logger.log('No stages found in YAML');
      continue;
    }

    for (const [stageIndex, stage] of json.stages.entries()) {
      const allSgfPaths = await findSgfs(
        SGF_DIR,
        stage.type === 'tournament' ? (stage.dir ?? String(year)) : String(year)
      );
      const sgfPaths = allSgfPaths.filter((path) => !claimedSgfs.has(path));

      const stageResult = await processStage({
        pairs: eventDefinition.pairs,
      tournament: json,
      stage,
      sgfPaths,
      dataDir: DATA_DIR,
      sgfDir: SGF_DIR,
      force,
      strict,
      eventPlayers,
    });

      if (stage.type !== 'classification') {
        for (const sgf of sgfPaths) {
          loadedSgfs.add(sgf);
        }
      }

      if (!stageResult.totalSgfs && !stageResult.previousEntries.length) {
        logger.log('No sgf files found');
        continue;
      }

      printStageReport(logger, stageResult);

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

  const eventSgfPaths = await findSgfs(SGF_DIR, '**');

  printSummary(
    results,
    eventSgfPaths.length,
    eventSgfPaths.filter((sgf) => !loadedSgfs.has(sgf))
  );
}
