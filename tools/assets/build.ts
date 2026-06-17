import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import type { EventContext } from '@/schema/event';
import { loadAllTranslations } from '@/i18n/server';
import { buildDataAssets, type BuildDataRequest } from '@tools/assets/data';
import type { BuildSgfRequest } from '@tools/assets/sgf';
import { buildSgfAssetsInWorkers } from '@tools/assets/sgfs';
import { buildZips } from '@tools/assets/zips';
import { loadData } from '@/data/load';

export async function buildAssets(events: EventContext[]) {
  const sgfTasks: BuildSgfRequest[] = [];
  const dataTasks: BuildDataRequest[] = [];

  await Promise.all(
    events.map(async (event) => {
      const [data, allTranslations] = await Promise.all([loadData(event), loadAllTranslations(event)]);
      const sgfDir = `./events/${event.id}/sgf`;
      const sgfOutputDir = path.join('./public', event.prefix || '', 'sgf');
      const dataOutputDir = path.join('./public', event.prefix || '', 'data');
      const translations = allTranslations[event.locales[0]];

      await rm(sgfOutputDir, { recursive: true, force: true });
      await rm(dataOutputDir, { recursive: true, force: true });
      await mkdir(sgfOutputDir, { recursive: true });
      await mkdir(dataOutputDir, { recursive: true });

      dataTasks.push({ event, data, allTranslations, outputDir: dataOutputDir });

      for (const tournament of data.tournaments) {
        for (const id in tournament.games) {
          const game = tournament.games[id];

          if (!game.props.sgf) {
            continue;
          }

          sgfTasks.push({
            event,
            sgfDir,
            outputDir: sgfOutputDir,
            game,
            tournament,
            translations,
          });
        }
      }
    })
  );

  const [sgfs] = await Promise.all([buildSgfAssetsInWorkers(sgfTasks), buildDataAssets(dataTasks)]);

  await buildZips(events, sgfs);
}
