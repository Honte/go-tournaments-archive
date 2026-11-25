import type { StatsMedals } from '@/schema/data';
import type { Locale, Translator } from '@/i18n/consts';
import { translateOptional } from '@/i18n/translator';
import {
  cleanWhitespace,
  formatCategoryLabel,
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

export function describeMultiArchive({ events, t }: ArchiveMetadataInput, title: string): string {
  if (events.length === 0) {
    return t('site.description');
  }

  return cleanWhitespace(
    t('metadata.archiveDescription', {
      title,
      tournaments: t('counts.tournamentsGenitive', { count: events.length }),
    })
  );
}

export function describeEventHome({ t, totalStats, tournaments }: EventHomeMetadataInput): string {
  const completed = getCompletedTournaments(tournaments);
  const years = completed.map((tournament) => tournament.year);
  const span = getYearSpan(years);
  const parts: string[] = [];

  if (completed.length > 0) {
    parts.push(withYearSpan(t('counts.editions', { count: completed.length }), span));
  }

  if (totalStats.players > 0) {
    parts.push(t('counts.players', { count: totalStats.players }));
  }

  if (totalStats.playedGames > 0) {
    parts.push(t('counts.games', { count: totalStats.playedGames }));
  }

  if (totalStats.sgfs > 0) {
    parts.push(t('counts.sgfs', { count: totalStats.sgfs }));
  }

  if (parts.length === 0) {
    return t('site.description');
  }

  return cleanWhitespace(t('metadata.homeSummary', { name: t('site.name'), summary: parts.join(', ') }));
}

export function describeTournament({ event, locale, t, tournament }: TournamentMetadataInput): string {
  const heading = getTournamentHeading(tournament, locale, t);
  const metaLine = formatTournamentMetaLine(tournament, event, locale, t);

  if (tournament.announcement) {
    const edition = metaLine ? `${heading} (${metaLine})` : heading;

    return cleanWhitespace(t('metadata.editionUpcoming', { edition }));
  }

  const sentences: string[] = [];
  const introParts: string[] = [];

  if (metaLine) {
    introParts.push(metaLine);
  }

  const participantCount = getTournamentParticipantCount(tournament);

  if (participantCount > 0) {
    introParts.push(t(event.pairs ? 'counts.pairs' : 'counts.players', { count: participantCount }));
  }

  sentences.push(introParts.length > 0 ? `${heading} — ${introParts.join(', ')}.` : `${heading}.`);

  const podium = getTournamentPodiumPlaces(tournament, 3);

  if (podium.length > 0) {
    const formattedPodium = podium.map((place) => `${place.rank}. ${place.names}`).join(', ');

    sentences.push(t('metadata.editionPodium', { podium: formattedPodium }));
  } else {
    const categoryWinners = getTournamentCategoryWinners(tournament, t);

    if (categoryWinners.length > 0) {
      const formattedCategories = categoryWinners.map((item) => `${item.category}: ${item.winner}`).join(', ');

      sentences.push(t('metadata.editionCategories', { categories: formattedCategories }));
    }
  }

  const sgfCount = getTournamentSgfCount(tournament);

  if (sgfCount > 0) {
    sentences.push(
      t('metadata.editionIncludesResultsAndSgfs', {
        sgfs: t('counts.sgfs', { count: sgfCount }),
      })
    );
  } else {
    sentences.push(t('metadata.editionIncludesResults'));
  }

  return cleanWhitespace(sentences.join(' '));
}

export function describeTournamentsOverview({ t, tournaments }: TournamentsOverviewMetadataInput): string {
  const completed = getCompletedTournaments(tournaments);

  if (completed.length === 0) {
    return t('site.tournamentsDescription');
  }

  const span = getYearSpan(completed.map((tournament) => tournament.year));
  const editions = withYearSpan(t('counts.editionsGenitive', { count: completed.length }), span);

  return cleanWhitespace(t('metadata.tournamentsSummary', { editions, event: getEventDisplayName(t) }));
}

export function describeAllPlayersStats({ t, totalStats, tournaments }: AllPlayersStatsMetadataInput): string {
  const completed = getCompletedTournaments(tournaments);
  const { players, playedGames } = totalStats;

  if (players === 0 || completed.length === 0) {
    return t('site.allTimeStatsDescription');
  }

  const span = getYearSpan(completed.map((tournament) => tournament.year));
  const editions = withYearSpan(t('counts.editionsLocative', { count: completed.length }), span);
  const details = [t('counts.players', { count: players })];

  if (playedGames > 0) {
    details.push(t('counts.games', { count: playedGames }));
  }

  return cleanWhitespace(
    t('metadata.allTimePlayersSummary', {
      details: details.join(', '),
      editions,
      event: getEventDisplayName(t),
    })
  );
}

export function describePlayerStats({ category, event, locale, player, t }: PlayerStatsMetadataInput): string {
  const nameParts = [player.name];

  if (event.showCountry && player.country.length > 0) {
    const countryNames: string[] = [];

    for (const code of player.country) {
      const translated = translateOptional(t, `country.${code}`);

      if (translated) {
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
    facts.push(t('counts.appearances', { count: player.totalAttended }));
  }

  const medalSummary = formatMedalSummary(player.medals, t);

  if (medalSummary) {
    facts.push(medalSummary);
  }

  if (event.showBestPlace && Number.isFinite(player.bestPlace)) {
    facts.push(t('metadata.bestPlace', { place: player.bestPlace }));
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
    return t('site.playerStatsDescription', { player: player.name });
  }

  return cleanWhitespace(
    t('metadata.playerSummary', {
      player: nameParts.join(' '),
      scope: eventScope,
      facts: facts.join(', '),
    })
  );
}

export function describeAllCountriesStats({
  countryCount,
  t,
  totalStats,
  tournaments,
}: AllCountriesStatsMetadataInput): string {
  const completed = getCompletedTournaments(tournaments);
  const { playedGames } = totalStats;

  if (countryCount === 0 || completed.length === 0) {
    return t('site.allTimeStatsByCountryDescription');
  }

  const span = getYearSpan(completed.map((tournament) => tournament.year));
  const editions = withYearSpan(t('counts.editionsLocative', { count: completed.length }), span);
  const details = [t('counts.countries', { count: countryCount })];

  if (playedGames > 0) {
    details.push(t('counts.games', { count: playedGames }));
  }

  return cleanWhitespace(
    t('metadata.allTimeCountriesSummary', {
      details: details.join(', '),
      editions,
      event: getEventDisplayName(t),
    })
  );
}

export function describeCountryStats({ category, country, event, locale, t }: CountryStatsMetadataInput): string {
  const countryName = translateOptional(t, `country.${country.code}`) ?? country.code;
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
    facts.push(t('counts.editions', { count: years.length }));
  }

  if (uniquePlayers.size > 0) {
    facts.push(t('counts.players', { count: uniquePlayers.size }));
  }

  const medalSummary = formatMedalSummary(country.medals, t);

  if (medalSummary) {
    facts.push(medalSummary);
  } else if (event.showBestPlace && Number.isFinite(country.bestPlace)) {
    facts.push(t('metadata.bestPlace', { place: country.bestPlace }));
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
    return t('site.countryStatsDescription', { country: countryName });
  }

  return cleanWhitespace(
    t('metadata.countrySummary', {
      country: countryName,
      scope: eventScope,
      facts: facts.join(', '),
    })
  );
}

export function describeCategoryStats({ category, stats, t }: CategoryStatsMetadataInput): string {
  const categoryName = formatCategoryLabel(category, t);

  if (stats.tournaments.length === 0) {
    return t('site.categoryStatsDescription', { category: categoryName });
  }

  const span = getYearSpan(stats.tournaments.map((tournament) => tournament.year));
  const editions = withYearSpan(t('counts.editions', { count: stats.tournaments.length }), span);

  return cleanWhitespace(
    t('metadata.categorySummary', {
      category: categoryName,
      event: getEventDisplayName(t),
      editions,
    })
  );
}

export function describeGames({ t, totalStats, tournaments }: GamesMetadataInput): string {
  const sgfCount = totalStats.sgfs;

  if (sgfCount === 0) {
    return t('site.gamesListDescription');
  }

  const years = getSgfTournamentYears(tournaments);
  const span = getYearSpan(years);
  const editions = withYearSpan(t('counts.editionsGenitive', { count: years.length }), span);

  return cleanWhitespace(
    t('metadata.gamesSummary', {
      sgfs: t('counts.sgfs', { count: sgfCount }),
      editions,
      event: getEventDisplayName(t),
    })
  );
}

function withYearSpan(label: string, span?: string): string {
  return span ? `${label} (${span})` : label;
}

function formatMedalSummary(medals: StatsMedals | undefined, t: Translator): string | undefined {
  if (!medals) {
    return undefined;
  }

  const [gold, silver, bronze] = medals;
  const total = gold.length + silver.length + bronze.length;

  if (total === 0) {
    return undefined;
  }

  const breakdown: string[] = [];

  if (gold.length > 0) {
    breakdown.push(`${gold.length}${t('medals.short.gold')}`);
  }

  if (silver.length > 0) {
    breakdown.push(`${silver.length}${t('medals.short.silver')}`);
  }

  if (bronze.length > 0) {
    breakdown.push(`${bronze.length}${t('medals.short.bronze')}`);
  }

  return t('metadata.medalsDetail', {
    medals: t('counts.medals', { count: total }),
    breakdown: breakdown.join(' '),
  });
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
  const percentage = Math.round((won / resolved) * 100);

  if (drawn > 0) {
    return t('metadata.recordWithDraws', {
      won: formatNumber(won, locale),
      lost: formatNumber(lost, locale),
      drawn: formatNumber(drawn, locale),
      percentage,
    });
  }

  return t('metadata.record', {
    won: formatNumber(won, locale),
    lost: formatNumber(lost, locale),
    percentage,
  });
}
