import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import type { InputTournament, InputTournamentStage } from '@/schema/input';
import fg from 'fast-glob';
import { parseDocument } from 'yaml';
import { printStageReport, printSummary } from './report';
import { findSgfs } from './sgf';
import { processStage } from './stage';
import type { StageResult } from './types';
import { updateYamlDoc } from './yaml';

const {
  values: { force },
  positionals,
} = parseArgs({
  options: {
    force: { type: 'boolean', default: false, short: 'f' },
  },
  allowPositionals: true,
});

const [event, yearArg] = positionals;
const filterYear = yearArg ? parseInt(yearArg, 10) : null;

if (!event || (yearArg && isNaN(filterYear!))) {
  console.error('Usage: npm run match:sgfs -- <event> [year] [--force]');
  process.exit(1);
}

const dataDir = `events/${event}/data`;
const results: StageResult[] = [];

const yamlFiles = await fg.glob(`${dataDir}/*.yml`);

if (!yamlFiles.length) {
  console.log(`No YAML files found in ${dataDir}`);
  process.exit(0);
}

for (const yamlPath of yamlFiles.sort()) {
  const year = parseInt(path.parse(yamlPath).name, 10);

  if (isNaN(year) || (filterYear && year !== filterYear)) {
    continue;
  }

  const yamlContent = await readFile(yamlPath, 'utf-8');
  const doc = parseDocument(yamlContent);
  const json = doc.toJSON() as InputTournament;
  const tournaments = json.stages.filter((s): s is InputTournamentStage => s.type === 'tournament');

  console.log(`=== ${event.toUpperCase()} ${year} ===`);

  if (!tournaments.length) {
    console.log('No tournament stages found.\n');
    continue;
  }

  let yamlModified = false;

  for (const stage of tournaments) {
    const sgfPaths = await findSgfs(dataDir, stage.dir ?? String(year));

    if (!sgfPaths.length) {
      console.log('No sgf files found.\n');
      continue;
    }

    const stageResult = await processStage(stage, sgfPaths, dataDir, force);

    printStageReport(stageResult);

    updateYamlDoc(doc, json.stages.indexOf(stage), stageResult);
    yamlModified = true;

    results.push({
      year,
      reused: stageResult.reusedEntries.length,
      matched: stageResult.matchedEntries.length,
      unmatched: stageResult.unmatchedEntries.length,
      totalSgfs: stageResult.totalSgfs,
    });
  }

  if (yamlModified) {
    await writeFile(yamlPath, doc.toString({ lineWidth: 0 }), 'utf-8');
    console.log(`Written to ${yamlPath}`);
  }

  console.log();
}

printSummary(results);
