import type { StatsMedals } from '@/schema/data';
import type { Locale, Translator } from '@/i18n/consts';
import {
  formatCategoryLabel,
  formatCount,
  formatNumber,
  formatTournamentMetaLine,
  getCompletedTournaments,
  getEventDisplayName,
  getTournamentCategoryWinners,
  getTournamentHeading,
  getTournamentParticipantCount,
  getTournamentPodiumNames,
  getTournamentSgfCount,
  getYearSpan,
} from './format';
import type {
  AllCountriesStatsMetadataInput,
  AllPlayersStatsMetadataInput,
  ArchiveMetadataInput,
  CategoryStatsMetadataInput,
  CountryStatsMetadataInput,
  EventHomeMetadataInput,
  GamesMetadataInput,
  PlayerStatsMetadataInput,
  TournamentMetadataInput,
  TournamentsOverviewMetadataInput,
} from './schema';

export function describeMultiArchive({ events, locale, t }: ArchiveMetadataInput, title: string): string {
  if (events.length === 0) {
    return t('site.description');
  }

  return t('metadata.archiveDescription', title, formatCount(events.length, 'tournamentsGenitive', locale));
}

export function describeEventHome({ data, locale, t }: EventHomeMetadataInput): string {
  const completed = getCompletedTournaments(data.tournaments);
  const years = completed.map((tournament) => tournament.year);
  const span = getYearSpan(years);
  const parts: string[] = [];

  if (completed.length > 0) {
    parts.push(withYearSpan(formatCount(completed.length, 'editions', locale), span));
  }

  if (data.summary.totalStats.players > 0) {
    parts.push(formatCount(data.summary.totalStats.players, 'players', locale));
  }

  if (data.summary.totalStats.playedGames > 0) {
    parts.push(formatCount(data.summary.totalStats.playedGames, 'games', locale));
  }

  if (data.summary.totalStats.sgfs > 0) {
    parts.push(formatCount(data.summary.totalStats.sgfs, 'sgfs', locale));
  }

  if (parts.length === 0) {
    return t('site.description');
  }

  return t('metadata.homeSummary', t('site.name'), parts.join(', '));
}

export function describeTournament({ event, locale, t, tournament }: TournamentMetadataInput): string {
  const heading = getTournamentHeading(tournament, locale, t);
  const metaLine = formatTournamentMetaLine(tournament, event, locale, t);

  if (tournament.announcement) {
    const header = metaLine ? `${heading} (${metaLine})` : heading;

    return t('metadata.editionUpcoming', header);
  }

  const sentences: string[] = [];
  const introParts: string[] = [];

  if (metaLine) {
    introParts.push(metaLine);
  }

  const participantCount = getTournamentParticipantCount(tournament);

  if (participantCount > 0) {
    introParts.push(formatCount(participantCount, event.pairs ? 'pairs' : 'players', locale));
  }

  sentences.push(introParts.length > 0 ? `${heading} — ${introParts.join(', ')}.` : `${heading}.`);

  const podium = getTournamentPodiumNames(tournament, 3);

  if (podium.length > 0) {
    const formattedPodium = podium.map((name, index) => `${index + 1}. ${name}`).join(', ');

    sentences.push(t('metadata.editionPodium', formattedPodium));
  } else {
    const categoryWinners = getTournamentCategoryWinners(tournament, t);

    if (categoryWinners.length > 0) {
      const formattedCategories = categoryWinners.map((item) => `${item.category}: ${item.winner}`).join(', ');

      sentences.push(t('metadata.editionCategories', formattedCategories));
    }
  }

  const sgfCount = getTournamentSgfCount(tournament);

  if (sgfCount > 0) {
    sentences.push(t('metadata.editionIncludesResultsAndSgfs', formatCount(sgfCount, 'sgfs', locale)));
  } else {
    sentences.push(t('metadata.editionIncludesResults'));
  }

  return sentences.join(' ');
}

export function describeTournamentsOverview({ data, locale, t }: TournamentsOverviewMetadataInput): string {
  const completed = getCompletedTournaments(data.tournaments);

  if (completed.length === 0) {
    return t('site.tournamentsDescription');
  }

  const span = getYearSpan(completed.map((tournament) => tournament.year));
  const editionsLabel = withYearSpan(formatCount(completed.length, 'editionsGenitive', locale), span);

  return t('metadata.tournamentsSummary', editionsLabel, getEventDisplayName(t));
}

export function describeAllPlayersStats({ data, locale, t }: AllPlayersStatsMetadataInput): string {
  const completed = getCompletedTournaments(data.tournaments);
  const { players, playedGames } = data.summary.totalStats;

  if (players === 0 || completed.length === 0) {
    return t('site.allTimeStatsDescription');
  }

  const span = getYearSpan(completed.map((tournament) => tournament.year));
  const editionsPart = withYearSpan(formatCount(completed.length, 'editionsLocative', locale), span);
  const details = [formatCount(players, 'players', locale)];

  if (playedGames > 0) {
    details.push(formatCount(playedGames, 'games', locale));
  }

  return t('metadata.allTimePlayersSummary', details.join(', '), editionsPart, getEventDisplayName(t));
}

export function describePlayerStats({ category, event, locale, player, t }: PlayerStatsMetadataInput): string {
  const nameParts = [player.name];

  if (event.showCountry && player.country.length > 0) {
    const countryNames: string[] = [];

    for (const code of player.country) {
      const translated = t(`country.${code}`);

      if (translated && translated !== `country.${code}`) {
        countryNames.push(translated);
      }
    }

    if (countryNames.length > 0) {
      nameParts.push(`(${countryNames.join(', ')})`);
    }
  }

  const eventScope = category
    ? `${getEventDisplayName(t)} (${formatCategoryLabel(category, t)})`
    : getEventDisplayName(t);

  const facts: string[] = [];

  if (player.totalAttended > 0) {
    facts.push(formatCount(player.totalAttended, 'appearances', locale));
  }

  const medalSummary = formatMedalSummary(player.medals, locale, t);

  if (medalSummary) {
    facts.push(medalSummary);
  }

  if (event.showBestPlace && Number.isFinite(player.bestPlace)) {
    facts.push(t('metadata.bestPlace', String(player.bestPlace)));
  }

  const recordSummary = formatWinLossRecord(
    player.totalWon,
    player.totalGames,
    player.totalDrawn,
    player.totalUnresolved,
    locale,
    t
  );

  if (recordSummary) {
    facts.push(recordSummary);
  }

  if (facts.length === 0) {
    return t('site.playerStatsDescription', player.name);
  }

  return t('metadata.playerSummary', nameParts.join(' '), eventScope, facts.join(', '));
}

export function describeAllCountriesStats({ data, locale, t }: AllCountriesStatsMetadataInput): string {
  const completed = getCompletedTournaments(data.tournaments);
  const countryCount = Object.keys(data.stats.countries).length;
  const { playedGames } = data.summary.totalStats;

  if (countryCount === 0 || completed.length === 0) {
    return t('site.allTimeStatsByCountryDescription');
  }

  const span = getYearSpan(completed.map((tournament) => tournament.year));
  const editionsPart = withYearSpan(formatCount(completed.length, 'editionsLocative', locale), span);
  const details = [formatCount(countryCount, 'countries', locale)];

  if (playedGames > 0) {
    details.push(formatCount(playedGames, 'games', locale));
  }

  return t('metadata.allTimeCountriesSummary', details.join(', '), editionsPart, getEventDisplayName(t));
}

export function describeCountryStats({ category, country, event, locale, t }: CountryStatsMetadataInput): string {
  const countryName = t(`country.${country.code}`);
  const eventScope = category
    ? `${getEventDisplayName(t)} (${formatCategoryLabel(category, t)})`
    : getEventDisplayName(t);

  const years = Object.values(country.years);
  const uniquePlayers = new Set<string>();

  for (const yearStats of years) {
    for (const result of yearStats.results) {
      uniquePlayers.add(result.id);
    }
  }

  const facts: string[] = [];

  if (years.length > 0) {
    facts.push(formatCount(years.length, 'editions', locale));
  }

  if (uniquePlayers.size > 0) {
    facts.push(formatCount(uniquePlayers.size, 'players', locale));
  }

  const medalSummary = formatMedalSummary(country.medals, locale, t);

  if (medalSummary) {
    facts.push(medalSummary);
  } else if (event.showBestPlace && Number.isFinite(country.bestPlace)) {
    facts.push(t('metadata.bestPlace', String(country.bestPlace)));
  }

  const recordSummary = formatWinLossRecord(
    country.totalWon,
    country.totalGames,
    country.totalDrawn,
    country.totalUnresolved,
    locale,
    t
  );

  if (recordSummary) {
    facts.push(recordSummary);
  }

  if (facts.length === 0) {
    return t('site.countryStatsDescription', countryName);
  }

  return t('metadata.countrySummary', countryName, eventScope, facts.join(', '));
}

export function describeCategoryStats({ category, locale, stats, t }: CategoryStatsMetadataInput): string {
  const categoryName = formatCategoryLabel(category, t);

  if (stats.tournaments.length === 0) {
    return t('site.categoryStatsDescription', categoryName);
  }

  const span = getYearSpan(stats.tournaments.map((tournament) => tournament.year));
  const editionsPart = withYearSpan(formatCount(stats.tournaments.length, 'editions', locale), span);

  return t('metadata.categorySummary', categoryName, getEventDisplayName(t), editionsPart);
}

export function describeGames({ data, locale, t }: GamesMetadataInput): string {
  const sgfCount = data.summary.totalStats.sgfs;

  if (sgfCount === 0) {
    return t('site.gamesListDescription');
  }

  const sgfYears: number[] = [];

  for (const tournament of data.tournaments) {
    if (!tournament.announcement && tournament.hasSgfs) {
      sgfYears.push(tournament.year);
    }
  }

  const years =
    sgfYears.length > 0 ? sgfYears : getCompletedTournaments(data.tournaments).map((tournament) => tournament.year);
  const span = getYearSpan(years);
  const editionsPart = withYearSpan(formatCount(years.length, 'editionsGenitive', locale), span);

  return t('metadata.gamesSummary', formatCount(sgfCount, 'sgfs', locale), editionsPart, getEventDisplayName(t));
}

function withYearSpan(label: string, span?: string): string {
  return span ? `${label} (${span})` : label;
}

function formatMedalSummary(medals: StatsMedals | undefined, locale: Locale, t: Translator): string | undefined {
  if (!medals) {
    return undefined;
  }

  const [gold, silver, bronze] = medals;
  const total = gold.length + silver.length + bronze.length;

  if (total === 0) {
    return undefined;
  }

  const labels = locale === 'pl' ? ['Z', 'S', 'B'] : ['G', 'S', 'B'];
  const breakdown: string[] = [];

  if (gold.length > 0) {
    breakdown.push(`${gold.length}${labels[0]}`);
  }

  if (silver.length > 0) {
    breakdown.push(`${silver.length}${labels[1]}`);
  }

  if (bronze.length > 0) {
    breakdown.push(`${bronze.length}${labels[2]}`);
  }

  return t('metadata.medalsDetail', formatCount(total, 'medals', locale), breakdown.join(' '));
}

function formatWinLossRecord(
  won: number,
  totalGames: number,
  drawn: number,
  unresolved: number,
  locale: Locale,
  t: Translator
): string | undefined {
  const resolved = totalGames - unresolved;

  if (resolved <= 0) {
    return undefined;
  }

  const lost = Math.max(0, resolved - won - drawn);
  const pct = Math.round((won / resolved) * 100);

  if (drawn > 0) {
    return t(
      'metadata.recordWithDraws',
      formatNumber(won, locale),
      formatNumber(lost, locale),
      formatNumber(drawn, locale),
      String(pct)
    );
  }

  return t('metadata.record', formatNumber(won, locale), formatNumber(lost, locale), String(pct));
}
