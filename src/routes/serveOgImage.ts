import path from 'node:path';
import fg from 'fast-glob';
import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import { loadConfiguredEvents } from '@/events';
import type { Locale } from '@/i18n/consts';
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
  renderOgCardJpeg,
  type OgCardSpec,
} from '@/libs/og';
import { loadData } from '@/data/load';

const JPG_HEADERS = {
  'Content-Type': 'image/jpeg',
  'Cache-Control': 'no-store',
};

export async function getSingleOgImageOptions(event: EventContext): Promise<{ path: string[] }[]> {
  return buildEventOgOptions(event);
}

export async function getMultiOgImageOptions(configuration: ArchiveConfiguration): Promise<{ path: string[] }[]> {
  const options: { path: string[] }[] = [];
  const locales = configuration.locales ?? ['en'];

  for (const locale of locales) {
    options.push({ path: [locale, 'archive.jpg'] });
  }

  const events = await loadConfiguredEvents(configuration);

  for (const event of events) {
    if (event.external || !event.prefix) {
      continue;
    }

    const eventOptions = await buildEventOgOptions(event, event.prefix);

    for (const option of eventOptions) {
      options.push(option);
    }
  }

  return options;
}

async function buildEventOgOptions(event: EventContext, prefix?: string): Promise<{ path: string[] }[]> {
  const files = await fg.glob(`./events/${event.id}/data/*.yml`);
  const years: string[] = [];

  for (const file of files) {
    const year = path.basename(file, '.yml');

    if (/^\d+$/.test(year)) {
      years.push(year);
    }
  }

  const options: { path: string[] }[] = [];
  const baseSegments = prefix ? [prefix] : [];

  for (const locale of event.locales) {
    options.push({ path: [...baseSegments, locale, 'general.jpg'] });
    options.push({ path: [...baseSegments, locale, 'stats.jpg'] });
    options.push({ path: [...baseSegments, locale, 'games.jpg'] });

    for (const year of years) {
      options.push({ path: [...baseSegments, locale, 'tournaments', `${year}.jpg`] });
    }
  }

  return options;
}

export async function serveArchiveOgImage(configuration: ArchiveConfiguration, localeSegment: string) {
  const locales = configuration.locales ?? ['en'];

  if (!isValidLocale(localeSegment, locales)) {
    return new Response('Not found', { status: 404 });
  }

  const allEvents = await loadConfiguredEvents(configuration);
  const [baseTranslations, eventTranslationsList, backgroundSrc, logo] = await Promise.all([
    loadBaseTranslations(localeSegment),
    Promise.all(allEvents.map((event) => loadTranslations(event, localeSegment))),
    loadGenericBackgroundDataUri(),
    loadArchiveLogoAsset(),
  ]);
  const t = getTranslator(baseTranslations);
  const acronyms = eventTranslationsList.map((translations) => getTranslator(translations)('site.acronym'));
  const card = buildArchiveCardSpec(configuration, acronyms, localeSegment, t);
  const jpeg = await renderOgCardJpeg({ card, backgroundSrc, logo });

  return new Response(new Uint8Array(jpeg), { headers: JPG_HEADERS });
}

export async function serveEventOgImage(event: EventContext, segments: string[]) {
  const [localeSegment, ...rest] = segments;

  if (!localeSegment || !isValidLocale(localeSegment, event.locales)) {
    return new Response('Not found', { status: 404 });
  }

  const [data, translations, backgroundSrc, logo] = await Promise.all([
    loadData(event),
    loadTranslations(event, localeSegment),
    loadEventBackgroundDataUri(event.id),
    loadEventLogoAsset(event.id),
  ]);
  const t = getTranslator(translations);
  const card = resolveEventCardSpec(event, data, localeSegment, t, rest);

  if (!card) {
    return new Response('Not found', { status: 404 });
  }

  const jpeg = await renderOgCardJpeg({ card, backgroundSrc, logo });

  return new Response(new Uint8Array(jpeg), { headers: JPG_HEADERS });
}

function resolveEventCardSpec(
  event: EventContext,
  data: Awaited<ReturnType<typeof loadData>>,
  locale: Locale,
  t: ReturnType<typeof getTranslator>,
  segments: string[]
): OgCardSpec | undefined {
  if (segments.length === 1) {
    if (segments[0] === 'general.jpg') {
      return buildEventGeneralCardSpec(event, data, locale, t);
    }

    if (segments[0] === 'stats.jpg') {
      return buildEventStatsCardSpec(data, locale, t);
    }

    if (segments[0] === 'games.jpg') {
      return buildEventGamesCardSpec(data, locale, t);
    }

    return undefined;
  }

  if (segments.length === 2 && segments[0] === 'tournaments' && /^\d+\.jpg$/.test(segments[1])) {
    const year = Number(segments[1].replace(/\.jpg$/, ''));
    const tournament = data.tournaments.find((item) => item.year === year);

    if (!tournament) {
      return undefined;
    }

    return buildEditionCardSpec(event, tournament, locale, t);
  }

  return undefined;
}

function isValidLocale(candidate: string, allowed: readonly Locale[]): candidate is Locale {
  return (allowed as readonly string[]).includes(candidate);
}
