import EVENT from '@event';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { EVENT_LOCALES } from '@/i18n/locales';
import { loadTranslations } from '@/i18n/server';
import { buildSgfAssets } from '@tools/assets/sgf';
import { createZipBuffer } from '@/libs/zip';
import { getTournaments } from '@/data';
import { getGameStage } from '@/data/sgfs';

const PUBLIC_SGF_DIR = './public/sgf';

export async function buildAssets() {
  console.log(`[assets] generating assets for ${EVENT}`);
  const start = Date.now();

  await rm(PUBLIC_SGF_DIR, { recursive: true, force: true });

  const sgfDir = `./events/${EVENT}/sgf`;
  const tournaments = await getTournaments();
  const translations = await loadTranslations(EVENT_LOCALES[0]);

  const sgfPromises = [];
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

      sgfPromises.push(buildSgfAssets(sgfDir, PUBLIC_SGF_DIR, game, stage, tournament, translations));
    }
  }

  const results = await Promise.all(sgfPromises);
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
