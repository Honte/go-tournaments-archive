import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { EventContext } from '@/schema/event';
import type { BuildSgfResponse } from '@tools/assets/sgf';
import { createZipBuffer } from '@/libs/zip';

type BuildZipRequest = {
  outputPath: string;
  files: { path: string; content: string }[];
};

export async function buildZips(events: EventContext[], results: BuildSgfResponse[]) {
  const zipTasks: BuildZipRequest[] = [];
  const outputPathMap = events.reduce<Record<string, string>>((agg, event) => {
    agg[event.id] = path.join('./public/sgf', event.withPrefix ? event.id : '');

    return agg;
  }, {});

  for (const [event, eventSgfs] of Map.groupBy(results, (sgf) => sgf.event)) {
    for (const [year, files] of Map.groupBy(eventSgfs, (sgf) => sgf.year)) {
      zipTasks.push({
        outputPath: path.join(outputPathMap[event], `${year}.zip`),
        files,
      });
    }
  }

  await Promise.all(zipTasks.map(({ outputPath, files }) => writeFile(outputPath, createZipBuffer(files))));
  console.log('[assets] completed zips');
}
