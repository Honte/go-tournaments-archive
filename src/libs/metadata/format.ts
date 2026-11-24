import type { Participant, Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Locale, Translator } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { formatDate, formatRange } from '@/libs/dates';
import { isPair } from '@/libs/participants';
import { joinPaths, normalizeBasePath } from '@/libs/urls';
import type { CategoryWinner } from './schema';
import { normalizeDomain } from '@/configuration';

export type PluralNoun =
  | 'editions'
  | 'editionsGenitive'
  | 'editionsLocative'
  | 'players'
  | 'pairs'
  | 'games'
  | 'sgfs'
  | 'sgfsShort'
  | 'countries'
  | 'appearances'
  | 'medals'
  | 'tournamentsGenitive';

type PluralForms = {
  one: string;
  few?: string;
  many: string;
};

const PLURALS: Record<Locale, Record<PluralNoun, PluralForms>> = {
  en: {
    editions: { one: 'edition', many: 'editions' },
    editionsGenitive: { one: 'edition', many: 'editions' },
    editionsLocative: { one: 'edition', many: 'editions' },
    players: { one: 'player', many: 'players' },
    pairs: { one: 'pair', many: 'pairs' },
    games: { one: 'game', many: 'games' },
    sgfs: { one: 'SGF game record', many: 'SGF game records' },
    sgfsShort: { one: 'SGF game', many: 'SGF games' },
    countries: { one: 'country', many: 'countries' },
    appearances: { one: 'appearance', many: 'appearances' },
    medals: { one: 'medal', many: 'medals' },
    tournamentsGenitive: { one: 'Go tournament', many: 'Go tournaments' },
  },
  pl: {
    editions: { one: 'edycja', few: 'edycje', many: 'edycji' },
    editionsGenitive: { one: 'edycji', few: 'edycji', many: 'edycji' },
    editionsLocative: { one: 'edycji', few: 'edycjach', many: 'edycjach' },
    players: { one: 'gracz', few: 'graczy', many: 'graczy' },
    pairs: { one: 'para', few: 'pary', many: 'par' },
    games: { one: 'partia', few: 'partie', many: 'partii' },
    sgfs: { one: 'zapis SGF', few: 'zapisy SGF', many: 'zapisów SGF' },
    sgfsShort: { one: 'partia SGF', few: 'partie SGF', many: 'partii SGF' },
    countries: { one: 'kraj', few: 'kraje', many: 'krajów' },
    appearances: { one: 'udział', few: 'udziały', many: 'udziałów' },
    medals: { one: 'medal', few: 'medale', many: 'medali' },
    tournamentsGenitive: { one: 'turnieju Go', few: 'turniejów Go', many: 'turniejów Go' },
  },
};

const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  en: 'en_US',
  pl: 'pl_PL',
};

const DEFAULT_EVENT_NAMES = new Set(['Tournament', 'Turniej']);

export function resolveMetadataBase(domain?: string): URL | undefined {
  const normalized = normalizeDomain(domain);

  if (!normalized) {
    return undefined;
  }

  try {
    return new URL(normalized);
  } catch {
    return undefined;
  }
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

export function getOpenGraphLocale(locale: Locale): string {
  return OPEN_GRAPH_LOCALES[locale] ?? locale;
}

export function getEventDisplayName(t: Translator): string {
  const eventName = t('site.eventName');

  if (eventName && !DEFAULT_EVENT_NAMES.has(eventName)) {
    return eventName;
  }

  return t('site.name');
}

export function getTournamentHeading(tournament: Tournament, locale: Locale, t: Translator): string {
  const customName = getString(tournament.name, locale);

  if (customName) {
    return customName;
  }

  return `${t('site.acronym')} ${tournament.year}`;
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value).replace(/[\u00a0\u202f]/g, ' ');
}

export function formatCount(count: number, noun: PluralNoun, locale: Locale): string {
  const forms = PLURALS[locale][noun];
  const label = selectPluralForm(count, forms, locale);

  return `${formatNumber(count, locale)} ${label}`;
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
    const countryName = t(`country.${tournament.country}`);

    if (countryName && countryName !== `country.${tournament.country}`) {
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

export function getTournamentPodiumNames(tournament: Tournament, limit = 3): string[] {
  const places: string[] = [];

  for (const placeIds of tournament.top.slice(0, limit)) {
    const names: string[] = [];

    for (const id of placeIds) {
      const participant = tournament.participants[id];

      if (participant) {
        names.push(formatParticipantLabel(participant));
      }
    }

    if (names.length > 0) {
      places.push(names.join(', '));
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

function translateOptional(t: Translator, key: string): string | undefined {
  const translated = t(key);

  return translated && translated !== key ? translated : undefined;
}

function selectPluralForm(count: number, forms: PluralForms, locale: Locale): string {
  const abs = Math.abs(count);

  if (abs === 1) {
    return forms.one;
  }

  if (locale === 'pl' && forms.few) {
    const mod10 = abs % 10;
    const mod100 = abs % 100;

    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
      return forms.few;
    }
  }

  return forms.many;
}

function parseValidDate(raw: string): Date | undefined {
  const parsed = new Date(raw);

  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function cleanWhitespace(text: string): string {
  return text.replace(/[\u00a0\u202f]/g, ' ').replace(/\s*–\s*/g, '–');
}
