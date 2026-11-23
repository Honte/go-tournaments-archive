import type { Metadata } from 'next';
import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import {
  allCountryStatsUrl,
  allGameStatsUrl,
  allPlayersStatsUrl,
  appleIconUrl,
  categoryUrl,
  countryUrl,
  faviconUrl,
  homeUrl,
  joinPaths,
  multiAppleIconUrl,
  multiFaviconUrl,
  ogArchiveImageUrl,
  ogGamesImageUrl,
  ogGeneralImageUrl,
  ogStatsImageUrl,
  ogTournamentImageUrl,
  playerUrl,
  tournamentsUrl,
  tournamentUrl,
} from '@/libs/urls';
import {
  describeAllCountriesStats,
  describeAllPlayersStats,
  describeCategoryStats,
  describeCountryStats,
  describeEventHome,
  describeGames,
  describeMultiArchive,
  describePlayerStats,
  describeTournament,
  describeTournamentsOverview,
} from './descriptions';
import { formatCategoryLabel, getOgLocale, getTournamentHeading, resolveMetadataBase } from './format';
import {
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  type AllCountriesStatsMetadataInput,
  type AllPlayersStatsMetadataInput,
  type ArchiveMetadataInput,
  type CategoryStatsMetadataInput,
  type CountryStatsMetadataInput,
  type EventHomeMetadataInput,
  type GamesMetadataInput,
  type PlayerStatsMetadataInput,
  type TournamentMetadataInput,
  type TournamentsOverviewMetadataInput,
} from './schema';

export {
  formatCategoryLabel,
  formatCount,
  formatDisplayDomain,
  formatNumber,
  formatParticipantLabel,
  formatTournamentDates,
  formatTournamentMetaLine,
  formatTournamentVenue,
  getCompletedTournaments,
  getEventDisplayName,
  getOgLocale,
  getTournamentCategoryWinners,
  getTournamentHeading,
  getTournamentParticipantCount,
  getTournamentPodiumNames,
  getTournamentSgfCount,
  getYearSpan,
  resolveMetadataBase,
} from './format';
export { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH } from './schema';
export type {
  AllCountriesStatsMetadataInput,
  AllPlayersStatsMetadataInput,
  ArchiveMetadataInput,
  CategoryStatsMetadataInput,
  CategoryWinner,
  CountryStatsMetadataInput,
  EventHomeMetadataInput,
  EventMetadataBase,
  GamesMetadataInput,
  PlayerStatsMetadataInput,
  TournamentMetadataInput,
  TournamentsOverviewMetadataInput,
} from './schema';

export function buildMultiArchiveLayoutMetadata(configuration: ArchiveConfiguration): Metadata {
  return {
    metadataBase: resolveMetadataBase(configuration.domain),
    icons: {
      icon: multiFaviconUrl(configuration.basePath),
      apple: multiAppleIconUrl(configuration.basePath),
    },
  };
}

export function buildMultiArchivePageMetadata(input: ArchiveMetadataInput): Metadata {
  const { configuration, locale, t } = input;
  const title = getString(configuration.title, locale) ?? t('metadata.archiveTitle');
  const description = describeMultiArchive(input, title);
  const canonical = joinPaths(configuration.basePath) || '/';
  const locales = configuration.locales ?? [locale];
  const alternateLocale = getAlternateOgLocales(locales, locale);
  const generateOg = configuration.config?.generateOgImages !== false;
  const imageUrl = generateOg ? ogArchiveImageUrl(configuration.basePath, locale) : undefined;

  return {
    metadataBase: resolveMetadataBase(configuration.domain),
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      siteName: title,
      title,
      description,
      url: canonical,
      locale: getOgLocale(locale),
      ...(alternateLocale ? { alternateLocale } : {}),
      ...(imageUrl ? { images: [buildOgImage(imageUrl, title)] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function buildEventLayoutMetadata(event: EventContext): Metadata {
  return {
    metadataBase: resolveMetadataBase(event.domain),
    icons: {
      icon: faviconUrl(event),
      apple: appleIconUrl(event),
    },
  };
}

export function buildEventHomeMetadata(input: EventHomeMetadataInput): Metadata {
  const { event, locale, t } = input;
  const siteName = t('site.name');
  const description = describeEventHome(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: siteName,
    socialTitle: siteName,
    description,
    pathForLocale: (targetLocale) => homeUrl(event, targetLocale),
    imageUrl: getEventOgImage(event, () => ogGeneralImageUrl(event, locale)),
    imageAlt: siteName,
  });
}

export function buildEventRedirectMetadata(input: EventHomeMetadataInput): Metadata {
  return buildEventHomeMetadata(input);
}

export function buildTournamentMetadata(input: TournamentMetadataInput): Metadata {
  const { event, locale, t, tournament } = input;
  const siteName = t('site.name');
  const heading = getTournamentHeading(tournament, locale, t);
  const description = describeTournament(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${heading} - ${siteName}`,
    socialTitle: heading,
    description,
    pathForLocale: (targetLocale) => tournamentUrl(event, targetLocale, tournament.year),
    imageUrl: getEventOgImage(event, () => ogTournamentImageUrl(event, locale, tournament.year)),
    imageAlt: `${heading} - ${siteName}`,
  });
}

export function buildTournamentsOverviewMetadata(input: TournamentsOverviewMetadataInput): Metadata {
  const { event, locale, t } = input;
  const siteName = t('site.name');
  const pageTitle = t('site.tournamentsTitle');
  const description = describeTournamentsOverview(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${pageTitle} - ${siteName}`,
    socialTitle: pageTitle,
    description,
    pathForLocale: (targetLocale) => tournamentsUrl(event, targetLocale),
    imageUrl: getEventOgImage(event, () => ogGeneralImageUrl(event, locale)),
    imageAlt: `${pageTitle} - ${siteName}`,
  });
}

export function buildAllPlayersStatsMetadata(input: AllPlayersStatsMetadataInput): Metadata {
  const { event, locale, t } = input;
  const siteName = t('site.name');
  const pageTitle = t('site.allTimeStatsTitle');
  const description = describeAllPlayersStats(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${pageTitle} - ${siteName}`,
    socialTitle: pageTitle,
    description,
    pathForLocale: (targetLocale) => allPlayersStatsUrl(event, targetLocale),
    imageUrl: getEventOgImage(event, () => ogStatsImageUrl(event, locale)),
    imageAlt: `${pageTitle} - ${siteName}`,
  });
}

export function buildPlayerStatsMetadata(input: PlayerStatsMetadataInput): Metadata {
  const { category, event, locale, player, t } = input;
  const siteName = t('site.name');
  const baseTitle = t('site.playerStatsTitle', player.name);
  const pageTitle = category ? `${baseTitle} (${formatCategoryLabel(category, t)})` : baseTitle;
  const description = describePlayerStats(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${pageTitle} - ${siteName}`,
    socialTitle: pageTitle,
    description,
    pathForLocale: (targetLocale) => playerUrl(event, targetLocale, player.id, category),
    imageUrl: getEventOgImage(event, () => ogStatsImageUrl(event, locale)),
    imageAlt: `${pageTitle} - ${siteName}`,
  });
}

export function buildAllCountriesStatsMetadata(input: AllCountriesStatsMetadataInput): Metadata {
  const { event, locale, t } = input;
  const siteName = t('site.name');
  const pageTitle = t('site.allTimeStatsByCountryTitle');
  const description = describeAllCountriesStats(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${pageTitle} - ${siteName}`,
    socialTitle: pageTitle,
    description,
    pathForLocale: (targetLocale) => allCountryStatsUrl(event, targetLocale),
    imageUrl: getEventOgImage(event, () => ogStatsImageUrl(event, locale)),
    imageAlt: `${pageTitle} - ${siteName}`,
  });
}

export function buildCountryStatsMetadata(input: CountryStatsMetadataInput): Metadata {
  const { category, country, event, locale, t } = input;
  const siteName = t('site.name');
  const countryName = t(`country.${country.code}`);
  const baseTitle = t('site.countryStatsTitle', countryName);
  const pageTitle = category ? `${baseTitle} (${formatCategoryLabel(category, t)})` : baseTitle;
  const description = describeCountryStats(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${pageTitle} - ${siteName}`,
    socialTitle: pageTitle,
    description,
    pathForLocale: (targetLocale) => countryUrl(event, targetLocale, country.code, category),
    imageUrl: getEventOgImage(event, () => ogStatsImageUrl(event, locale)),
    imageAlt: `${pageTitle} - ${siteName}`,
  });
}

export function buildCategoryStatsMetadata(input: CategoryStatsMetadataInput): Metadata {
  const { category, event, locale, t } = input;
  const siteName = t('site.name');
  const categoryName = formatCategoryLabel(category, t);
  const pageTitle = t('site.categoryStatsTitle', categoryName);
  const description = describeCategoryStats(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${pageTitle} - ${siteName}`,
    socialTitle: pageTitle,
    description,
    pathForLocale: (targetLocale) => categoryUrl(event, targetLocale, category),
    imageUrl: getEventOgImage(event, () => ogStatsImageUrl(event, locale)),
    imageAlt: `${pageTitle} - ${siteName}`,
  });
}

export function buildGamesMetadata(input: GamesMetadataInput): Metadata {
  const { event, locale, t } = input;
  const siteName = t('site.name');
  const pageTitle = t('site.gamesListTitle');
  const description = describeGames(input);

  return buildEventPageMetadata({
    event,
    locale,
    siteName,
    documentTitle: `${pageTitle} - ${siteName}`,
    socialTitle: pageTitle,
    description,
    pathForLocale: (targetLocale) => allGameStatsUrl(event, targetLocale),
    imageUrl: getEventOgImage(event, () => ogGamesImageUrl(event, locale)),
    imageAlt: `${pageTitle} - ${siteName}`,
  });
}

type EventPageMetadataParams = {
  event: EventContext;
  locale: Locale;
  siteName: string;
  documentTitle: string;
  socialTitle: string;
  description: string;
  pathForLocale: (locale: Locale) => string;
  imageUrl?: string;
  imageAlt: string;
};

function buildEventPageMetadata({
  description,
  documentTitle,
  event,
  imageAlt,
  imageUrl,
  locale,
  pathForLocale,
  siteName,
  socialTitle,
}: EventPageMetadataParams): Metadata {
  const canonical = withBasePath(event.basePath, pathForLocale(locale));
  const languages = buildLanguageAlternates(event, pathForLocale);
  const alternateLocale = getAlternateOgLocales(event.locales, locale);

  return {
    metadataBase: resolveMetadataBase(event.domain),
    title: documentTitle,
    description,
    alternates: {
      canonical,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      type: 'website',
      siteName,
      title: socialTitle,
      description,
      url: canonical,
      locale: getOgLocale(locale),
      ...(alternateLocale ? { alternateLocale } : {}),
      ...(imageUrl ? { images: [buildOgImage(imageUrl, imageAlt)] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

function buildLanguageAlternates(
  event: EventContext,
  pathForLocale: (locale: Locale) => string
): Record<string, string> | undefined {
  if (event.locales.length <= 1) {
    return undefined;
  }

  const languages: Record<string, string> = {};

  for (const targetLocale of event.locales) {
    languages[targetLocale] = withBasePath(event.basePath, pathForLocale(targetLocale));
  }

  languages['x-default'] = languages[event.locales[0]];

  return languages;
}

function getAlternateOgLocales(locales: readonly Locale[], currentLocale: Locale): string[] | undefined {
  const alternates: string[] = [];

  for (const locale of locales) {
    if (locale !== currentLocale) {
      alternates.push(getOgLocale(locale));
    }
  }

  return alternates.length > 0 ? alternates : undefined;
}

function withBasePath(basePath: string | undefined, pagePath: string): string {
  return joinPaths(basePath, pagePath) || '/';
}

function getEventOgImage(event: EventContext, buildUrl: () => string): string | undefined {
  if (event.generateOgImages === false) {
    return undefined;
  }

  return buildUrl();
}

function buildOgImage(url: string, alt: string) {
  return {
    url,
    width: OG_IMAGE_WIDTH,
    height: OG_IMAGE_HEIGHT,
    alt,
    type: 'image/jpeg',
  };
}
