import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import { loadConfiguredEvents } from '@/events';
import type { Locale } from '@/i18n/consts';
import { isEventLocale } from '@/i18n/locales';
import { loadBaseTranslations } from '@/i18n/server';
import { getTranslator } from '@/i18n/translator';
import {
  buildArchiveCardSpec,
  buildEditionCardSpec,
  buildEventGamesCardSpec,
  buildEventGeneralCardSpec,
  buildEventStatsCardSpec,
  loadArchiveEventAcronyms,
  loadArchiveLogoAsset,
  loadEventBackgroundDataUri,
  loadEventLogoAsset,
  loadGenericBackgroundDataUri,
  renderSocialCardJpeg,
  type SocialCardSpec,
} from '@/libs/socialCards';
import {
  getAvailableTournaments,
  getEventSummary,
  getTournament,
  getTournaments,
  getTranslations,
} from '@/data/serverApi';

const JPG_HEADERS = {
  'Content-Type': 'image/jpeg',
  'Cache-Control': 'no-store',
};

type EventSocialRouteTarget =
  | { type: 'general' }
  | { type: 'stats' }
  | { type: 'games' }
  | { type: 'edition'; year: number };

export function getArchiveSocialImageOptions(configuration: ArchiveConfiguration): { locale: string }[] {
  const primaryLocale = configuration.locales?.[0] ?? 'en';

  return [{ locale: `${primaryLocale}.jpg` }];
}

export async function getEventSocialImageOptions(event: EventContext): Promise<{ locale: string; path: string[] }[]> {
  const years = await getAvailableTournaments(event);
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
  const locale = match?.[1] as Locale | undefined;
  const locales = configuration.locales ?? ['en'];

  if (!locale || !locales.includes(locale)) {
    return new Response('Not found', { status: 404 });
  }

  const allEvents = await loadConfiguredEvents(configuration);
  const [baseTranslations, acronyms, backgroundSrc, logo] = await Promise.all([
    loadBaseTranslations(locale),
    loadArchiveEventAcronyms(allEvents, locale),
    loadGenericBackgroundDataUri(),
    loadArchiveLogoAsset(),
  ]);
  const t = getTranslator(baseTranslations);
  const card = buildArchiveCardSpec(configuration, acronyms, locale, t);
  const jpeg = await renderSocialCardJpeg({ card, backgroundSrc, logo });

  return new Response(new Uint8Array(jpeg), { headers: JPG_HEADERS });
}

export async function serveEventSocialImage(event: EventContext, localeSegment: string, segments: string[]) {
  if (!isEventLocale(event, localeSegment)) {
    return new Response('Not found', { status: 404 });
  }

  const target = parseEventSocialRouteTarget(segments);

  if (!target) {
    return new Response('Not found', { status: 404 });
  }

  const [card, backgroundSrc, logo] = await Promise.all([
    buildTargetCardSpec(event, localeSegment, target),
    loadEventBackgroundDataUri(event.id),
    loadEventLogoAsset(event.id),
  ]);

  if (!card) {
    return new Response('Not found', { status: 404 });
  }

  const jpeg = await renderSocialCardJpeg({ card, backgroundSrc, logo });

  return new Response(new Uint8Array(jpeg), { headers: JPG_HEADERS });
}

async function buildTargetCardSpec(
  event: EventContext,
  locale: Locale,
  target: EventSocialRouteTarget
): Promise<SocialCardSpec | undefined> {
  if (target.type === 'edition') {
    const [translations, tournament] = await Promise.all([
      getTranslations(event, locale),
      getTournament(event, target.year),
    ]);

    if (!tournament) {
      return undefined;
    }

    return buildEditionCardSpec(event, tournament, locale, getTranslator(translations));
  }

  const [translations, tournaments, summary] = await Promise.all([
    getTranslations(event, locale),
    getTournaments(event),
    getEventSummary(event),
  ]);
  const t = getTranslator(translations);
  const statsInput = { tournaments, totalStats: summary.totalStats };

  switch (target.type) {
    case 'general':
      return buildEventGeneralCardSpec(event, statsInput, locale, t);
    case 'stats':
      return buildEventStatsCardSpec(statsInput, locale, t);
    case 'games':
      return buildEventGamesCardSpec(statsInput, locale, t);
  }
}

function parseEventSocialRouteTarget(segments: string[]): EventSocialRouteTarget | undefined {
  if (segments.length === 1) {
    if (segments[0] === 'general.jpg') {
      return { type: 'general' };
    }

    if (segments[0] === 'stats.jpg') {
      return { type: 'stats' };
    }

    if (segments[0] === 'games.jpg') {
      return { type: 'games' };
    }

    return undefined;
  }

  if (segments.length === 2 && segments[0] === 'tournaments' && /^\d+\.jpg$/.test(segments[1])) {
    return { type: 'edition', year: Number(segments[1].replace(/\.jpg$/, '')) };
  }

  return undefined;
}
