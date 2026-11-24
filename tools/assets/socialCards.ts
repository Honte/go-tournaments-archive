import { availableParallelism } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Piscina from 'piscina';
import type { ArchiveConfiguration, EventContext, EventData } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { loadBaseTranslations, loadTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import {
  buildArchiveCardSpec,
  buildEditionCardSpec,
  buildEventGamesCardSpec,
  buildEventGeneralCardSpec,
  buildEventStatsCardSpec,
  loadArchiveLogoAsset,
  loadEventBackgroundDataUri,
  loadEventLogoAsset,
  loadGenericBackgroundDataUri,
} from '@/libs/socialCards';
import type { BuildSocialCardRequest } from './socialCardWorker';

const SOCIAL_CARD_WORKER_PATH = fileURLToPath(new URL('./socialCardWorker.ts', import.meta.url));
const STATUS_DELAY = 5000;

export type EventSocialAssetSource = {
  event: EventContext;
  data: EventData;
  allTranslations: Record<Locale, Translations>;
};

export async function buildSocialAssets(
  configuration: ArchiveConfiguration,
  allEvents: EventContext[],
  eventSources: EventSocialAssetSource[],
  publicSocialDir: string
): Promise<void> {
  const tasks = await collectSocialTasks(configuration, allEvents, eventSources, publicSocialDir);

  if (tasks.length === 0) {
    return;
  }

  const workerCount = getSocialImageWorkerCount(tasks.length);
  console.log(
    `[assets] generating ${tasks.length} social images with ${workerCount} worker${workerCount === 1 ? '' : 's'}`
  );

  const pool = new Piscina<BuildSocialCardRequest, string>({
    filename: SOCIAL_CARD_WORKER_PATH,
    minThreads: workerCount,
    maxThreads: workerCount,
    execArgv: ['--import', 'tsx'],
  });

  const interval = setInterval(() => console.log(`[assets] completed ${pool.completed} social images`), STATUS_DELAY);

  try {
    await Promise.all(tasks.map((task) => pool.run(task)));
  } catch (err) {
    console.log(`[assets] failed to process social images`);
    throw err;
  } finally {
    await pool.destroy();
    clearInterval(interval);
  }
}

async function collectSocialTasks(
  configuration: ArchiveConfiguration,
  allEvents: EventContext[],
  eventSources: EventSocialAssetSource[],
  publicSocialDir: string
): Promise<BuildSocialCardRequest[]> {
  const tasks: BuildSocialCardRequest[] = [];

  if (allEvents.length > 1 && configuration.config?.generateSocialImages !== false) {
    const selectorTasks = await collectArchiveSelectorTasks(configuration, allEvents, publicSocialDir);

    for (const task of selectorTasks) {
      tasks.push(task);
    }
  }

  const perEventTaskLists = await Promise.all(
    eventSources.map((source) => collectEventSocialTasks(source, publicSocialDir))
  );

  for (const list of perEventTaskLists) {
    for (const task of list) {
      tasks.push(task);
    }
  }

  return tasks;
}

async function collectArchiveSelectorTasks(
  configuration: ArchiveConfiguration,
  allEvents: EventContext[],
  publicSocialDir: string
): Promise<BuildSocialCardRequest[]> {
  const locales = configuration.locales ?? ['en'];
  const [backgroundSrc, logo] = await Promise.all([loadGenericBackgroundDataUri(), loadArchiveLogoAsset()]);
  const tasks: BuildSocialCardRequest[] = [];

  for (const locale of locales) {
    const [baseTranslations, eventTranslationsList] = await Promise.all([
      loadBaseTranslations(locale),
      Promise.all(allEvents.map((event) => loadTranslations(event, locale))),
    ]);
    const t = getTranslator(baseTranslations);
    const acronyms = eventTranslationsList.map((translations) => getTranslator(translations)('site.acronym'));

    tasks.push({
      card: buildArchiveCardSpec(configuration, acronyms, locale, t),
      backgroundSrc,
      logo,
      outputPath: path.join(publicSocialDir, 'archive', `${locale}.jpg`),
    });
  }

  return tasks;
}

async function collectEventSocialTasks(
  source: EventSocialAssetSource,
  publicSocialDir: string
): Promise<BuildSocialCardRequest[]> {
  const { allTranslations, data, event } = source;

  if (event.generateSocialImages === false) {
    return [];
  }

  const [backgroundSrc, logo] = await Promise.all([loadEventBackgroundDataUri(event.id), loadEventLogoAsset(event.id)]);
  const eventOutputDir = path.join(publicSocialDir, event.prefix || '');
  const tasks: BuildSocialCardRequest[] = [];

  for (const locale of event.locales) {
    const translations = allTranslations[locale];

    if (!translations) {
      continue;
    }

    const t = getTranslator(translations);
    const localeDir = path.join(eventOutputDir, locale);

    tasks.push({
      card: buildEventGeneralCardSpec(event, data, locale, t),
      backgroundSrc,
      logo,
      outputPath: path.join(localeDir, 'general.jpg'),
    });

    tasks.push({
      card: buildEventStatsCardSpec(data, locale, t),
      backgroundSrc,
      logo,
      outputPath: path.join(localeDir, 'stats.jpg'),
    });

    tasks.push({
      card: buildEventGamesCardSpec(data, locale, t),
      backgroundSrc,
      logo,
      outputPath: path.join(localeDir, 'games.jpg'),
    });

    for (const tournament of data.tournaments) {
      tasks.push({
        card: buildEditionCardSpec(event, tournament, locale, t),
        backgroundSrc,
        logo,
        outputPath: path.join(localeDir, 'tournaments', `${tournament.year}.jpg`),
      });
    }
  }

  return tasks;
}

function getSocialImageWorkerCount(taskCount: number): number {
  const override = process.env.SOCIAL_IMAGE_WORKERS;

  if (override) {
    const parsed = Number(override);

    if (Number.isInteger(parsed) && parsed > 0) {
      return Math.min(taskCount, parsed);
    }

    console.warn(`[assets] ignoring invalid SOCIAL_IMAGE_WORKERS value: ${override}`);
  }

  return Math.min(taskCount, Math.max(1, availableParallelism() - 1));
}
