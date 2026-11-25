import path from 'node:path';
import type { ArchiveConfiguration, EventContext, EventData } from '@/schema/event';
import type { Locale, Translations } from '@/i18n/consts';
import { loadBaseTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import {
  buildArchiveCardSpec,
  buildEditionCardSpec,
  buildEventGamesCardSpec,
  buildEventGeneralCardSpec,
  buildEventStatsCardSpec,
  loadArchiveEventAcronyms,
} from '@/libs/socialCards';
import type { BuildSocialCardRequest } from './socialCardWorker';
import { runWorkerPool } from './workers';

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

  await runWorkerPool<BuildSocialCardRequest, string>({
    label: 'social images',
    workerUrl: new URL('./socialCardWorker.ts', import.meta.url),
    envVar: 'SOCIAL_IMAGE_WORKERS',
    tasks,
  });
}

async function collectSocialTasks(
  configuration: ArchiveConfiguration,
  allEvents: EventContext[],
  eventSources: EventSocialAssetSource[],
  publicSocialDir: string
): Promise<BuildSocialCardRequest[]> {
  const tasks: BuildSocialCardRequest[] = [];

  if (allEvents.length > 1 && configuration.config?.generateSocialImages !== false) {
    const locale = configuration.locales?.[0] ?? 'en';
    const [baseTranslations, acronyms] = await Promise.all([
      loadBaseTranslations(locale),
      loadArchiveEventAcronyms(allEvents, locale),
    ]);

    tasks.push({
      card: buildArchiveCardSpec(configuration, acronyms, locale, getTranslator(baseTranslations)),
      outputPath: path.join(publicSocialDir, 'archive', `${locale}.jpg`),
    });
  }

  for (const source of eventSources) {
    collectEventSocialTasks(source, publicSocialDir, tasks);
  }

  return tasks;
}

function collectEventSocialTasks(
  { allTranslations, data, event }: EventSocialAssetSource,
  publicSocialDir: string,
  tasks: BuildSocialCardRequest[]
): void {
  if (event.generateSocialImages === false) {
    return;
  }

  const eventOutputDir = path.join(publicSocialDir, event.prefix || '');
  const statsInput = { tournaments: data.tournaments, totalStats: data.summary.totalStats };

  for (const locale of event.locales) {
    const translations = allTranslations[locale];

    if (!translations) {
      continue;
    }

    const t = getTranslator(translations);
    const localeDir = path.join(eventOutputDir, locale);

    tasks.push(
      {
        eventId: event.id,
        card: buildEventGeneralCardSpec(event, statsInput, t),
        outputPath: path.join(localeDir, 'general.jpg'),
      },
      {
        eventId: event.id,
        card: buildEventStatsCardSpec(statsInput, locale, t),
        outputPath: path.join(localeDir, 'stats.jpg'),
      },
      {
        eventId: event.id,
        card: buildEventGamesCardSpec(statsInput, t),
        outputPath: path.join(localeDir, 'games.jpg'),
      }
    );

    for (const tournament of data.tournaments) {
      tasks.push({
        eventId: event.id,
        card: buildEditionCardSpec(event, tournament, locale, t),
        outputPath: path.join(localeDir, 'tournaments', `${tournament.year}.jpg`),
      });
    }
  }
}
