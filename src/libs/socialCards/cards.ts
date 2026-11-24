import type { Tournament } from '@/schema/data';
import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import type { Locale, Translator } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import {
  formatCount,
  formatDisplayDomain,
  formatNumber,
  formatPluralNoun,
  formatTournamentMetaLine,
  getCompletedTournaments,
  getEventDisplayName,
  getSgfTournamentYears,
  getTournamentCategoryWinners,
  getTournamentHeading,
  getTournamentParticipantCount,
  getTournamentPodiumPlaces,
  getTournamentSgfCount,
  getYearSpan,
} from '@/libs/metadata';
import type {
  ArchiveCardSpec,
  EditionCardSpec,
  EventCardStatsInput,
  GamesCardSpec,
  GeneralCardSpec,
  StatsCardSpec,
} from './schema';

const MAX_ARCHIVE_ACRONYMS = 9;
const MAX_CATEGORY_WINNERS = 4;

export function buildArchiveCardSpec(
  configuration: ArchiveConfiguration,
  eventAcronyms: readonly string[],
  locale: Locale,
  t: Translator
): ArchiveCardSpec {
  const title = getString(configuration.title, locale) ?? t('metadata.archiveTitle');
  const subtitle =
    eventAcronyms.length > 0
      ? t('socialCard.archiveSubtitle', formatCount(eventAcronyms.length, 'tournamentsGenitive', locale))
      : t('site.description');
  const visibleAcronyms = eventAcronyms.slice(0, MAX_ARCHIVE_ACRONYMS);
  const extraEventsCount = Math.max(0, eventAcronyms.length - visibleAcronyms.length);

  return {
    type: 'archive',
    title,
    subtitle,
    displayDomain: formatDisplayDomain(configuration.domain, configuration.basePath),
    eventAcronyms: visibleAcronyms,
    extraEventsCount,
  };
}

export function buildEventGeneralCardSpec(
  event: EventContext,
  { totalStats, tournaments }: EventCardStatsInput,
  locale: Locale,
  t: Translator
): GeneralCardSpec {
  const completed = getCompletedTournaments(tournaments);
  const span = getYearSpan(completed.map((tournament) => tournament.year));
  const { players, sgfs } = totalStats;
  const pills: string[] = [];

  if (span) {
    pills.push(span);
  }

  if (completed.length > 0) {
    pills.push(formatCount(completed.length, 'editions', locale));
  }

  if (players > 0) {
    pills.push(formatCount(players, 'players', locale));
  }

  if (sgfs > 0) {
    pills.push(formatCount(sgfs, 'sgfsShort', locale));
  }

  return {
    type: 'general',
    siteName: t('site.name'),
    acronym: t('site.acronym'),
    displayDomain: formatDisplayDomain(event.domain, event.basePath, event.prefix),
    subtitle: sgfs > 0 ? t('socialCard.generalSubtitle') : t('socialCard.generalSubtitleNoSgf'),
    pills,
  };
}

export function buildEditionCardSpec(
  event: EventContext,
  tournament: Tournament,
  locale: Locale,
  t: Translator
): EditionCardSpec {
  const heading = getTournamentHeading(tournament, locale, t);
  const metaLine = formatTournamentMetaLine(tournament, event, locale, t);
  const displayDomain = formatDisplayDomain(event.domain, event.basePath, event.prefix);

  if (tournament.announcement) {
    return {
      type: 'edition',
      siteName: t('site.name'),
      displayDomain,
      heading,
      metaLine,
      upcomingBadge: t('socialCard.upcomingBadge'),
      podium: [],
      categoryWinners: [],
      isPairs: Boolean(event.pairs),
    };
  }

  const statParts: string[] = [];
  const participantCount = getTournamentParticipantCount(tournament);

  if (participantCount > 0) {
    statParts.push(formatCount(participantCount, event.pairs ? 'pairs' : 'players', locale));
  }

  const sgfCount = getTournamentSgfCount(tournament);

  if (sgfCount > 0) {
    statParts.push(formatCount(sgfCount, 'sgfsShort', locale));
  }

  const podium = getTournamentPodiumPlaces(tournament, 3);
  const categoryWinners =
    podium.length === 0 ? getTournamentCategoryWinners(tournament, t).slice(0, MAX_CATEGORY_WINNERS) : [];

  return {
    type: 'edition',
    siteName: t('site.name'),
    displayDomain,
    heading,
    metaLine,
    statsLine: statParts.length > 0 ? statParts.join(', ') : undefined,
    podium,
    categoryWinners,
    isPairs: Boolean(event.pairs),
  };
}

export function buildEventStatsCardSpec(
  { totalStats, tournaments }: EventCardStatsInput,
  locale: Locale,
  t: Translator
): StatsCardSpec {
  const completed = getCompletedTournaments(tournaments);
  const { players, playedGames } = totalStats;
  const metrics: { value: string; label: string }[] = [];

  if (completed.length > 0) {
    metrics.push({
      value: formatNumber(completed.length, locale),
      label: formatPluralNoun(completed.length, 'editions', locale),
    });
  }

  if (players > 0) {
    metrics.push({
      value: formatNumber(players, locale),
      label: formatPluralNoun(players, 'players', locale),
    });
  }

  if (playedGames > 0) {
    metrics.push({
      value: formatNumber(playedGames, locale),
      label: formatPluralNoun(playedGames, 'games', locale),
    });
  }

  return {
    type: 'stats',
    badge: t('socialCard.statsBadge'),
    title: getEventDisplayName(t),
    subtitle: t('socialCard.statsSubtitle'),
    metrics,
  };
}

export function buildEventGamesCardSpec(
  { totalStats, tournaments }: EventCardStatsInput,
  locale: Locale,
  t: Translator
): GamesCardSpec {
  const sgfCount = totalStats.sgfs;
  const span = getYearSpan(getSgfTournamentYears(tournaments));
  const pills: string[] = [];

  if (sgfCount > 0) {
    pills.push(formatCount(sgfCount, 'sgfsShort', locale));
  }

  if (span) {
    pills.push(span);
  }

  return {
    type: 'games',
    badge: t('socialCard.gamesBadge'),
    title: getEventDisplayName(t),
    subtitle: t('socialCard.gamesSubtitle'),
    pills,
  };
}
