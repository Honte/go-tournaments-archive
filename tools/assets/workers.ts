import { availableParallelism } from 'node:os';
import { fileURLToPath } from 'node:url';
import Piscina from 'piscina';

const STATUS_DELAY = 5000;

export type WorkerPoolOptions<TRequest> = {
  label: string;
  workerUrl: URL;
  envVar: string;
  tasks: TRequest[];
};

export async function runWorkerPool<TRequest, TResponse>({
  label,
  workerUrl,
  envVar,
  tasks,
}: WorkerPoolOptions<TRequest>): Promise<TResponse[]> {
  if (tasks.length === 0) {
    return [];
  }

  const workerCount = getWorkerCount(tasks.length, envVar);
  console.log(`[assets] generating ${tasks.length} ${label} with ${workerCount} worker${workerCount === 1 ? '' : 's'}`);

  const pool = new Piscina<TRequest, TResponse>({
    filename: fileURLToPath(workerUrl),
    minThreads: workerCount,
    maxThreads: workerCount,
    execArgv: ['--import', 'tsx'],
  });

  const interval = setInterval(() => console.log(`[assets] completed ${pool.completed} ${label}`), STATUS_DELAY);

  try {
    return await Promise.all(tasks.map((task) => pool.run(task)));
  } catch (err) {
    console.log(`[assets] failed to process ${label}`);
    throw err;
  } finally {
    await pool.destroy();
    clearInterval(interval);
  }
}

function getWorkerCount(taskCount: number, envVar: string): number {
  const override = process.env[envVar];

  if (override) {
    const parsed = Number(override);

    if (Number.isInteger(parsed) && parsed > 0) {
      return Math.min(taskCount, parsed);
    }

    console.warn(`[assets] ignoring invalid ${envVar} value: ${override}`);
  }

  return Math.min(taskCount, Math.max(1, availableParallelism() - 1));
}
