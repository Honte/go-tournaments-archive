import type { Metadata } from 'next';
import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import type { Locale, Translator } from '@/i18n/consts';
import { getString } from '@/i18n/utils';
import { SOCIAL_IMAGE_HEIGHT, SOCIAL_IMAGE_WIDTH } from '@/libs/socialCards/schema';
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
  playerUrl,
  socialArchiveImageUrl,
  socialGamesImageUrl,
  socialGeneralImageUrl,
  socialStatsImageUrl,
  socialTournamentImageUrl,
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
import { formatCategoryLabel, getOpenGraphLocale, getTournamentHeading, resolveMetadataBase } from './format';
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

export function buildMultiArchiveLayoutMetadata(configuration: ArchiveConfiguration): Metadata {
  return {
    metadataBase: resolveMetadataBase(configuration.domain),
    icons: {
      icon: { url: multiFaviconUrl(configuration.basePath), type: 'image/svg+xml' },
      apple: { url: multiAppleIconUrl(configuration.basePath), type: 'image/png', sizes: '180x180' },
    },
  };
}

export function buildMultiArchivePageMetadata(input: ArchiveMetadataInput): Metadata {
  const { configuration, locale, t } = input;
  const title = getString(configuration.title, locale) ?? t('metadata.archiveTitle');
  const description = describeMultiArchive(input, title);
  const canonical = joinPaths(configuration.basePath) || '/';
  const locales = configuration.locales ?? [locale];
  const alternateLocale = getAlternateOpenGraphLocales(locales, locale);
  const generateSocial = configuration.config?.generateSocialImages !== false;
  const imageUrl = generateSocial ? socialArchiveImageUrl(configuration.basePath, locale) : undefined;

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
      locale: getOpenGraphLocale(locale),
      ...(alternateLocale ? { alternateLocale } : {}),
      ...(imageUrl ? { images: [buildSocialImage(imageUrl, title)] } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
  };
}

export function buildEventLayoutMetadata(event: EventContext, t?: Translator): Metadata {
  return {
    metadataBase: resolveMetadataBase(event.domain),
    ...(t
      ? {
          title: t('site.name'),
          description: t('site.description'),
        }
      : {}),
    icons: {
      icon: { url: faviconUrl(event), type: 'image/svg+xml' },
      apple: { url: appleIconUrl(event), type: 'image/png', sizes: '180x180' },
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
    imageUrl: getEventSocialImage(event, () => socialGeneralImageUrl(event, locale)),
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
    imageUrl: getEventSocialImage(event, () => socialTournamentImageUrl(event, locale, tournament.year)),
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
    imageUrl: getEventSocialImage(event, () => socialGeneralImageUrl(event, locale)),
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
    imageUrl: getEventSocialImage(event, () => socialStatsImageUrl(event, locale)),
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
    imageUrl: getEventSocialImage(event, () => socialStatsImageUrl(event, locale)),
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
    imageUrl: getEventSocialImage(event, () => socialStatsImageUrl(event, locale)),
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
    imageUrl: getEventSocialImage(event, () => socialStatsImageUrl(event, locale)),
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
    imageUrl: getEventSocialImage(event, () => socialStatsImageUrl(event, locale)),
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
    imageUrl: getEventSocialImage(event, () => socialGamesImageUrl(event, locale)),
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
  const alternateLocale = getAlternateOpenGraphLocales(event.locales, locale);

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
      locale: getOpenGraphLocale(locale),
      ...(alternateLocale ? { alternateLocale } : {}),
      ...(imageUrl ? { images: [buildSocialImage(imageUrl, imageAlt)] } : {}),
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

function getAlternateOpenGraphLocales(locales: readonly Locale[], currentLocale: Locale): string[] | undefined {
  const alternates: string[] = [];

  for (const locale of locales) {
    if (locale !== currentLocale) {
      alternates.push(getOpenGraphLocale(locale));
    }
  }

  return alternates.length > 0 ? alternates : undefined;
}

function withBasePath(basePath: string | undefined, pagePath: string): string {
  return joinPaths(basePath, pagePath) || '/';
}

function getEventSocialImage(event: EventContext, buildUrl: () => string): string | undefined {
  if (event.generateSocialImages === false) {
    return undefined;
  }

  return buildUrl();
}

function buildSocialImage(url: string, alt: string) {
  return {
    url,
    width: SOCIAL_IMAGE_WIDTH,
    height: SOCIAL_IMAGE_HEIGHT,
    alt,
    type: 'image/jpeg',
  };
}
