import { writeFile } from 'node:fs/promises';
import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Piscina from 'piscina';
import type { EventContext } from '@/schema/event';
import type { BuildSgfRequest, BuildSgfResponse } from '@tools/assets/sgf';

const SGF_WORKER_PATH = fileURLToPath(new URL('./sgf.ts', import.meta.url));
const STATUS_DELAY = 5000;

export function buildSgfLists(events: EventContext[], outputDir: string, results: BuildSgfResponse[]) {
  return Promise.all(
    events.map((event) => {
      const targetDir = path.join(outputDir, event.prefix || '');
      const games = results.filter((sgf) => sgf.event === event.id).map((sgf) => sgf.details);

      return writeFile(path.join(targetDir, 'list.json'), JSON.stringify(games));
    })
  );
}

export async function buildSgfAssetsInWorkers(tasks: BuildSgfRequest[]): Promise<BuildSgfResponse[]> {
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
  } catch (err) {
    console.log(`[assets] failed to process sgfs`);
    throw err;
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
