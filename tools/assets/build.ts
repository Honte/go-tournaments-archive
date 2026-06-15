import { mkdir, rm, writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Piscina from 'piscina';
import type { EventContext } from '@/schema/event';
import { loadTranslations } from '@/i18n/server';
import type { BuildSgfRequest, BuildSgfResponse } from '@tools/assets/sgf';
import { createZipBuffer } from '@/libs/zip';
import { getTournaments } from '@/data';
import { getGameStage } from '@/data/sgfs';

const PUBLIC_SGF_DIR = './public/sgf';
const SGF_WORKER_PATH = fileURLToPath(new URL('./sgf.ts', import.meta.url));
const STATUS_DELAY = 5000;

export async function buildAssets(event: EventContext) {
  console.log(`[assets] generating assets for ${event.id}`);
  const start = Date.now();

  await rm(PUBLIC_SGF_DIR, { recursive: true, force: true });

  const sgfDir = `./events/${event.id}/sgf`;
  const tournaments = await getTournaments(event);
  const translations = await loadTranslations(event);

  const sgfTasks: BuildSgfRequest[] = [];
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (!game.props.sgf) {
        continue;
      }

      const stage = getGameStage(tournament, id);

      if (!stage) {
        continue;
      }

      sgfTasks.push({
        event,
        sgfDir,
        outputDir: PUBLIC_SGF_DIR,
        game,
        stage,
        tournament,
        translations,
      });
    }
  }

  const results = await buildSgfAssetsInWorkers(sgfTasks);
  const sgfsByYear = Map.groupBy(results, (result) => result.year);
  const list = results.map((result) => result.details);

  await mkdir(PUBLIC_SGF_DIR, { recursive: true });
  await writeFile(path.join(PUBLIC_SGF_DIR, 'list.json'), JSON.stringify(list));

  const zipPromises = [];
  for (const [year, files] of sgfsByYear) {
    zipPromises.push(handleZip(year, files));
  }
  await Promise.all(zipPromises);

  console.log(`[assets] completed in ${Date.now() - start}ms`);
}

async function handleZip(year: number, files: { path: string; content: string }[]): Promise<void> {
  await writeFile(path.join(PUBLIC_SGF_DIR, `${year}.zip`), createZipBuffer(files));
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
