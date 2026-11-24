import type { CategoryStats, CountryStats, PlayerStats, StatsSummary, Tournament } from '@/schema/data';
import type { ArchiveConfiguration, EventContext } from '@/schema/event';
import type { Locale, Translator } from '@/i18n/consts';

export const SOCIAL_IMAGE_WIDTH = 1200;
export const SOCIAL_IMAGE_HEIGHT = 630;

export type EventMetadataBase = {
  event: EventContext;
  locale: Locale;
  t: Translator;
};

export type ArchiveMetadataInput = {
  configuration: ArchiveConfiguration;
  events: EventContext[];
  locale: Locale;
  t: Translator;
};

export type EventHomeMetadataInput = EventMetadataBase & {
  tournaments: Tournament[];
  totalStats: StatsSummary;
};

export type TournamentMetadataInput = EventMetadataBase & {
  tournament: Tournament;
};

export type TournamentsOverviewMetadataInput = EventMetadataBase & {
  tournaments: Tournament[];
};

export type AllPlayersStatsMetadataInput = EventMetadataBase & {
  tournaments: Tournament[];
  totalStats: StatsSummary;
};

export type PlayerStatsMetadataInput = EventMetadataBase & {
  player: PlayerStats;
  category?: string;
};

export type AllCountriesStatsMetadataInput = EventMetadataBase & {
  tournaments: Tournament[];
  totalStats: StatsSummary;
  countryCount: number;
};

export type CountryStatsMetadataInput = EventMetadataBase & {
  country: CountryStats;
  category?: string;
};

export type CategoryStatsMetadataInput = EventMetadataBase & {
  category: string;
  stats: CategoryStats;
};

export type GamesMetadataInput = EventMetadataBase & {
  tournaments: Tournament[];
  totalStats: StatsSummary;
};

export type PodiumPlace = {
  rank: number;
  names: string;
};

export type CategoryWinner = {
  category: string;
  label: string;
  winner: string;
};
