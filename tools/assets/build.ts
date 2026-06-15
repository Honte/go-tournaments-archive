import { mkdir, rm, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Piscina from 'piscina';
import type { EventContext } from '@/schema/event';
import { loadTranslations } from '@/i18n/server';
import type { BuildSgfRequest, BuildSgfResponse } from '@tools/assets/sgf';
import { createZipBuffer } from '@/libs/zip';
import { loadData } from '@/data/load';

const SGF_WORKER_PATH = fileURLToPath(new URL('./sgf.ts', import.meta.url));
const STATUS_DELAY = 5000;

export async function buildAssets(event: EventContext) {
  console.log(`[assets] generating assets for ${event.id}`);
  const start = Date.now();

  const sgfDir = `./events/${event.id}/sgf`;
  const outputDir = path.join('./public', event.prefix || '', 'sgf');
  const { tournaments } = await loadData(event);
  const translations = await loadTranslations(event);

  await rm(outputDir, { recursive: true, force: true });

  const sgfTasks: BuildSgfRequest[] = [];
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (!game.props.sgf) {
        continue;
      }

      sgfTasks.push({
        event,
        sgfDir,
        outputDir,
        game,
        tournament,
        translations,
      });
    }
  }

  const results = await buildSgfAssetsInWorkers(sgfTasks);
  const sgfsByYear = Map.groupBy(results, (result) => result.year);
  const list = results.map((result) => result.details);

  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, 'list.json'), JSON.stringify(list));

  const zipPromises = [];
  for (const [year, files] of sgfsByYear) {
    zipPromises.push(handleZip(outputDir, year, files));
  }
  await Promise.all(zipPromises);

  console.log(`[assets] completed in ${Date.now() - start}ms`);
}

async function handleZip(outputDir: string, year: number, files: { path: string; content: string }[]): Promise<void> {
  await writeFile(path.join(outputDir, `${year}.zip`), createZipBuffer(files));
}

async function buildSgfAssetsInWorkers(tasks: BuildSgfRequest[]): Promise<BuildSgfResponse[]> {
  if (tasks.length === 0) {
    return [];
  }

  const workerCount = getSgfAssetWorkerCount(tasks.length);
  console.log(`[assets] generating ${tasks.length} sgfs with ${workerCount} worker${workerCount === 1 ? '' : 's'}`);

  const pool = new Piscina<BuildSgfRequest, BuildSgfResponse>({
    filename: SGF_WORKER_PATH,
    minThreads: workerCount,
    maxThreads: workerCount,
    execArgv: ['--import', 'tsx'],
  });

  const interval = setInterval(() => console.log(`[assets] completed ${pool.completed} sgfs`), STATUS_DELAY);

  try {
    return await Promise.all(tasks.map((task) => pool.run(task)));
  } finally {
    await pool.destroy();
    clearInterval(interval);
  }
}

function getSgfAssetWorkerCount(taskCount: number): number {
  const override = process.env.SGF_ASSET_WORKERS;

  if (override) {
    const parsed = Number(override);

    if (Number.isInteger(parsed) && parsed > 0) {
      return Math.min(taskCount, parsed);
    }

    console.warn(`[assets] ignoring invalid SGF_ASSET_WORKERS value: ${override}`);
  }

  return Math.min(taskCount, Math.max(1, availableParallelism() - 1));
}
