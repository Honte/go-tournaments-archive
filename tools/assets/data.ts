import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Tournament } from '@/schema/data';
import type { EventContext, EventData } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { loadTournamentDescription } from '@/data/description';
import { getSitemap } from '@/data/sitemap';

export async function buildDataAssets(
  event: EventContext,
  data: EventData,
  allTranslations: Record<Locale, Translations>
): Promise<void> {
  const outputDir = path.join('./public', event.prefix || '', 'data');
  const { tournaments, stats, summary } = data;

  await rm(outputDir, { recursive: true, force: true });

  await Promise.all([
    writeJson(outputDir, 'tournaments.json', tournaments),
    writeJson(outputDir, path.join('stats', 'summary.json'), summary),
    writeJson(outputDir, path.join('stats', 'players.json'), stats.players),
    writeJson(outputDir, path.join('stats', 'countries.json'), stats.countries),
    ...tournaments.map((tournament) => writeTournament(outputDir, event, tournament)),
    ...event.locales.map((locale) =>
      writeJson(outputDir, path.join('i18n', `${locale}.json`), allTranslations[locale])
    ),
    ...event.locales.map((locale) =>
      writeJson(
        outputDir,
        path.join('sitemap', `${locale}.json`),
        getSitemap(event, tournaments, allTranslations[locale])
      )
    ),
    ...Object.values(stats.players)
      .filter((playerStats) => playerStats.id !== 'BYE')
      .map((playerStats) => writeJson(outputDir, path.join('stats', 'player', `${playerStats.id}.json`), playerStats)),
    ...Object.values(stats.countries).map((countryStats) =>
      writeJson(outputDir, path.join('stats', 'country', `${countryStats.code.toLowerCase()}.json`), countryStats)
    ),
    ...(event.categories ?? []).map((category) =>
      writeJson(outputDir, path.join('stats', 'category', `${category}.json`), stats.categories[category])
    ),
  ]);

  console.log('[assets] completed jsons');
}

async function writeTournament(outputDir: string, event: EventContext, tournament: Tournament) {
  return writeJson(outputDir, `${tournament.year}.json`, {
    ...tournament,
    description: await loadTournamentDescription(event, tournament.year),
  });
}

async function writeJson(outputDir: string, file: string, data: unknown): Promise<void> {
  const outputPath = path.join(outputDir, file);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(data));
}
