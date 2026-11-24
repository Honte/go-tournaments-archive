import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { EventContext } from '@/schema/event';
import type { BuildSgfRequest, BuildSgfResponse } from '@tools/assets/sgf';
import { runWorkerPool } from '@tools/assets/workers';

export function buildSgfLists(events: EventContext[], outputDir: string, results: BuildSgfResponse[]) {
  return Promise.all(
    events.map((event) => {
      const targetDir = path.join(outputDir, event.prefix || '');
      const games = results.filter((sgf) => sgf.event === event.id).map((sgf) => sgf.details);

      return writeFile(path.join(targetDir, 'list.json'), JSON.stringify(games));
    })
  );
}

export function buildSgfAssetsInWorkers(tasks: BuildSgfRequest[]): Promise<BuildSgfResponse[]> {
  return runWorkerPool<BuildSgfRequest, BuildSgfResponse>({
    label: 'sgfs',
    workerUrl: new URL('./sgf.ts', import.meta.url),
    envVar: 'SGF_ASSET_WORKERS',
    tasks,
  });
}
