import type { Participant, Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translator } from '@/i18n/consts';
import { translateOptional } from '@/i18n/translator';
import { getString } from '@/i18n/utils';
import { formatDate, formatRange } from '@/libs/dates';
import { isPair } from '@/libs/participants';
import { joinPaths, normalizeBasePath, normalizeDomain } from '@/libs/urls';
import type { CategoryWinner, PodiumPlace } from './schema';

export function resolveMetadataBase(domain?: string): URL | undefined {
  const normalized = normalizeDomain(domain);

  return normalized ? (URL.parse(normalized) ?? undefined) : undefined;
}

export function formatDisplayDomain(domain?: string, basePath?: string, prefix?: string): string | undefined {
  const metadataBase = resolveMetadataBase(domain);

  if (!metadataBase) {
    return undefined;
  }

  const host = metadataBase.host.replace(/^www\./, '');
  const fullPath = joinPaths(normalizeBasePath(basePath), prefix);

  return fullPath ? `${host}${fullPath}` : host;
}

export function getOpenGraphLocale(locale: string): string {
  try {
    const maximized = new Intl.Locale(locale).maximize();

    if (maximized.region && /^[A-Z]{2}$/.test(maximized.region)) {
      return `${maximized.language}_${maximized.region}`;
    }
  } catch {
    // Fall back to the raw locale tag when Intl.Locale rejects the input.
  }

  return locale;
}

export function getEventDisplayName(t: Translator): string {
  return translateOptional(t, 'site.eventName') ?? t('site.name');
}

export function getTournamentHeading(tournament: Tournament, locale: Locale, t: Translator): string {
  const customName = getString(tournament.name, locale);

  if (customName) {
    return customName;
  }

  return `${t('site.acronym')} ${tournament.year}`;
}

export function formatNumber(value: number, locale: Locale): string {
  return cleanWhitespace(new Intl.NumberFormat(locale).format(value));
}

export function cleanWhitespace(text: string): string {
  return text.replace(/[\u00a0\u202f]/g, ' ').replace(/\s*–\s*/g, '–');
}

export function getYearSpan(years: readonly number[]): string | undefined {
  if (years.length === 0) {
    return undefined;
  }

  let min = years[0];
  let max = years[0];

  for (const year of years) {
    if (year < min) {
      min = year;
    }

    if (year > max) {
      max = year;
    }
  }

  if (min < 1900) {
    return undefined;
  }

  return min === max ? String(min) : `${min}–${max}`;
}

export function getCompletedTournaments(tournaments: readonly Tournament[]): Tournament[] {
  const completed: Tournament[] = [];

  for (const tournament of tournaments) {
    if (!tournament.announcement) {
      completed.push(tournament);
    }
  }

  return completed;
}

export function getSgfTournamentYears(tournaments: readonly Tournament[]): number[] {
  const sgfYears: number[] = [];

  for (const tournament of tournaments) {
    if (!tournament.announcement && tournament.hasSgfs) {
      sgfYears.push(tournament.year);
    }
  }

  if (sgfYears.length > 0) {
    return sgfYears;
  }

  return getCompletedTournaments(tournaments).map((tournament) => tournament.year);
}

export function formatTournamentDates(tournament: Tournament, locale: Locale): string | undefined {
  const start = tournament.start ? parseValidDate(tournament.start) : undefined;
  const end = tournament.end ? parseValidDate(tournament.end) : undefined;

  if (start && end) {
    const formatted =
      start.getTime() === end.getTime() ? formatDate(start, locale, true) : formatRange(start, end, locale, true);

    return cleanWhitespace(formatted);
  }

  if (start) {
    return cleanWhitespace(formatDate(start, locale, true));
  }

  return undefined;
}

export function formatTournamentVenue(tournament: Tournament, event: EventContext, t: Translator): string | undefined {
  const parts: string[] = [];

  if (tournament.location) {
    parts.push(tournament.location);
  }

  if (event.showCountry && tournament.country) {
    const countryName = translateOptional(t, `country.${tournament.country}`);

    if (countryName) {
      parts.push(countryName);
    }
  }

  return parts.length > 0 ? parts.join(', ') : undefined;
}

export function formatTournamentMetaLine(
  tournament: Tournament,
  event: EventContext,
  locale: Locale,
  t: Translator
): string | undefined {
  const venue = formatTournamentVenue(tournament, event, t);
  const dates = formatTournamentDates(tournament, locale);
  const parts: string[] = [];

  if (venue) {
    parts.push(venue);
  }

  if (dates) {
    parts.push(dates);
  }

  return parts.length > 0 ? parts.join(', ') : undefined;
}

export function formatParticipantLabel(participant: Participant): string {
  if (isPair(participant)) {
    return `${participant.members[0].name} / ${participant.members[1].name}`;
  }

  return participant.name;
}

export function getTournamentPodiumPlaces(tournament: Tournament, limit = 3): PodiumPlace[] {
  const places: PodiumPlace[] = [];
  const slots = tournament.top.slice(0, limit);

  for (let index = 0; index < slots.length; index++) {
    const names: string[] = [];

    for (const id of slots[index]) {
      const participant = tournament.participants[id];

      if (participant) {
        names.push(formatParticipantLabel(participant));
      }
    }

    if (names.length > 0) {
      places.push({ rank: index + 1, names: names.join(', ') });
    }
  }

  return places;
}

export function getTournamentCategoryWinners(tournament: Tournament, t: Translator): CategoryWinner[] {
  if (!tournament.categoriesTop) {
    return [];
  }

  const winners: CategoryWinner[] = [];

  for (const [category, top] of Object.entries(tournament.categoriesTop)) {
    const firstIds = top[0];

    if (!firstIds || firstIds.length === 0) {
      continue;
    }

    const names: string[] = [];

    for (const id of firstIds) {
      const participant = tournament.participants[id];

      if (participant) {
        names.push(formatParticipantLabel(participant));
      }
    }

    if (names.length === 0) {
      continue;
    }

    const shortLabel = translateOptional(t, `categories.short.${category}`) ?? category.toUpperCase();
    const fullLabel = translateOptional(t, `categories.full.${category}`) ?? shortLabel;

    winners.push({
      category: shortLabel,
      label: fullLabel,
      winner: names.join(', '),
    });
  }

  return winners;
}

export function getTournamentParticipantCount(tournament: Tournament): number {
  return Object.keys(tournament.participants).length;
}

export function getTournamentSgfCount(tournament: Tournament): number {
  let count = 0;

  for (const game of Object.values(tournament.games)) {
    if (game.props.sgf) {
      count += 1;
    }
  }

  return count;
}

export function formatCategoryLabel(category: string, t: Translator): string {
  return (
    translateOptional(t, `categories.full.${category}`) ??
    translateOptional(t, `categories.short.${category}`) ??
    category
  );
}

function parseValidDate(raw: string): Date | undefined {
  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}
