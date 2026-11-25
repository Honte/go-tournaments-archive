import type { Tournament } from '@/schema/data';
import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import type { Locale, Translator } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import {
  cleanWhitespace,
  formatNumber,
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
      ? cleanWhitespace(
          t('socialCard.archiveSubtitle', {
            tournaments: t('counts.tournamentsGenitive', { count: eventAcronyms.length }),
          })
        )
      : t('site.description');
  const visibleAcronyms = eventAcronyms.slice(0, MAX_ARCHIVE_ACRONYMS);
  const extraEventsCount = Math.max(0, eventAcronyms.length - visibleAcronyms.length);

  return {
    type: 'archive',
    title,
    subtitle,
    eventAcronyms: visibleAcronyms,
    extraEventsCount,
  };
}

export function buildEventGeneralCardSpec(
  { totalStats, tournaments }: EventCardStatsInput,
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
    pills.push(cleanWhitespace(t('counts.editions', { count: completed.length })));
  }

  if (players > 0) {
    pills.push(cleanWhitespace(t('counts.players', { count: players })));
  }

  if (sgfs > 0) {
    pills.push(cleanWhitespace(t('counts.sgfsShort', { count: sgfs })));
  }

  return {
    type: 'general',
    siteName: t('site.name'),
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
  const siteName = getHeaderSiteName(t('site.name'), heading);

  if (tournament.announcement) {
    return {
      type: 'edition',
      siteName,
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
    statParts.push(cleanWhitespace(t(event.pairs ? 'counts.pairs' : 'counts.players', { count: participantCount })));
  }

  const sgfCount = getTournamentSgfCount(tournament);

  if (sgfCount > 0) {
    statParts.push(cleanWhitespace(t('counts.sgfsShort', { count: sgfCount })));
  }

  const podium = getTournamentPodiumPlaces(tournament, 3);
  const categoryWinners =
    podium.length === 0 ? getTournamentCategoryWinners(tournament, t).slice(0, MAX_CATEGORY_WINNERS) : [];

  return {
    type: 'edition',
    siteName,
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
  const { players, playedGames, sgfs } = totalStats;
  const title = getEventDisplayName(t);
  const metrics: { value: string; label: string }[] = [];

  if (completed.length > 0) {
    metrics.push({
      value: formatNumber(completed.length, locale),
      label: t('socialCard.statsMetrics.editions', { count: completed.length }),
    });
  }

  if (players > 0) {
    metrics.push({
      value: formatNumber(players, locale),
      label: t('socialCard.statsMetrics.players', { count: players }),
    });
  }

  if (playedGames > 0) {
    metrics.push({
      value: formatNumber(playedGames, locale),
      label: t('socialCard.statsMetrics.games', { count: playedGames }),
    });
  }

  return {
    type: 'stats',
    siteName: getHeaderSiteName(t('site.name'), title),
    title,
    subtitle: sgfs > 0 ? t('socialCard.statsSubtitle') : t('socialCard.statsSubtitleNoSgf'),
    metrics,
  };
}

export function buildEventGamesCardSpec(
  { totalStats, tournaments }: EventCardStatsInput,
  t: Translator
): GamesCardSpec {
  const sgfCount = totalStats.sgfs;
  const span = getYearSpan(getSgfTournamentYears(tournaments));
  const title = getEventDisplayName(t);
  const pills: string[] = [];

  if (sgfCount > 0) {
    pills.push(cleanWhitespace(t('counts.sgfsShort', { count: sgfCount })));
  }

  if (span) {
    pills.push(span);
  }

  return {
    type: 'games',
    siteName: getHeaderSiteName(t('site.name'), title),
    title,
    subtitle: t('socialCard.gamesSubtitle'),
    pills,
  };
}

function getHeaderSiteName(siteName: string, middleTitle: string): string | undefined {
  return cleanWhitespace(siteName) !== cleanWhitespace(middleTitle) ? siteName : undefined;
}
