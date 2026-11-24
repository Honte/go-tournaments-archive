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
  renderSocialCardJpeg,
  type SocialCardSpec,
} from '@/libs/socialCards';
import { loadData } from '@/data/load';

const JPG_HEADERS = {
  'Content-Type': 'image/jpeg',
  'Cache-Control': 'no-store',
};

export function getArchiveSocialImageOptions(configuration: ArchiveConfiguration): { locale: string }[] {
  const locales = configuration.locales ?? ['en'];

  return locales.map((locale) => ({
    locale: `${locale}.jpg`,
  }));
}

export async function getEventSocialImageOptions(event: EventContext): Promise<{ locale: string; path: string[] }[]> {
  const files = await fg.glob(`./events/${event.id}/data/*.yml`);
  const years: string[] = [];

  for (const file of files) {
    const year = path.basename(file, '.yml');

    if (/^\d+$/.test(year)) {
      years.push(year);
    }
  }

  const options: { locale: string; path: string[] }[] = [];

  for (const locale of event.locales) {
    options.push({ locale, path: ['general.jpg'] });
    options.push({ locale, path: ['stats.jpg'] });
    options.push({ locale, path: ['games.jpg'] });

    for (const year of years) {
      options.push({ locale, path: ['tournaments', `${year}.jpg`] });
    }
  }

  return options;
}

export async function serveArchiveSocialImage(configuration: ArchiveConfiguration, localeParam: string) {
  const match = localeParam.match(/^([a-z]{2})\.jpg$/);
  const locale = match?.[1];
  const locales = configuration.locales ?? ['en'];

  if (!locale || !isValidLocale(locale, locales)) {
    return new Response('Not found', { status: 404 });
  }

  const allEvents = await loadConfiguredEvents(configuration);
  const [baseTranslations, eventTranslationsList, backgroundSrc, logo] = await Promise.all([
    loadBaseTranslations(locale),
    Promise.all(allEvents.map((event) => loadTranslations(event, locale))),
    loadGenericBackgroundDataUri(),
    loadArchiveLogoAsset(),
  ]);
  const t = getTranslator(baseTranslations);
  const acronyms = eventTranslationsList.map((translations) => getTranslator(translations)('site.acronym'));
  const card = buildArchiveCardSpec(configuration, acronyms, locale, t);
  const jpeg = await renderSocialCardJpeg({ card, backgroundSrc, logo });

  return new Response(new Uint8Array(jpeg), { headers: JPG_HEADERS });
}

export async function serveEventSocialImage(event: EventContext, localeSegment: string, segments: string[]) {
  if (!isValidLocale(localeSegment, event.locales)) {
    return new Response('Not found', { status: 404 });
  }

  const [data, translations, backgroundSrc, logo] = await Promise.all([
    loadData(event),
    loadTranslations(event, localeSegment),
    loadEventBackgroundDataUri(event.id),
    loadEventLogoAsset(event.id),
  ]);
  const t = getTranslator(translations);
  const card = resolveEventCardSpec(event, data, localeSegment, t, segments);

  if (!card) {
    return new Response('Not found', { status: 404 });
  }

  const jpeg = await renderSocialCardJpeg({ card, backgroundSrc, logo });

  return new Response(new Uint8Array(jpeg), { headers: JPG_HEADERS });
}

function resolveEventCardSpec(
  event: EventContext,
  data: Awaited<ReturnType<typeof loadData>>,
  locale: Locale,
  t: ReturnType<typeof getTranslator>,
  segments: string[]
): SocialCardSpec | undefined {
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
