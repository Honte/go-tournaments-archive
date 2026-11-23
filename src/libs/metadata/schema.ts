import type { CategoryStats, CountryStats, PlayerStats, Tournament } from '@/schema/data';
import type { ArchiveConfiguration, EventContext, EventData } from '@/schema/event';
import type { Locale, Translations, Translator } from '@/i18n/consts';

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

export type EventMetadataBase = {
  event: EventContext;
  locale: Locale;
  translations: Translations;
  t: Translator;
};

export type ArchiveMetadataInput = {
  configuration: ArchiveConfiguration;
  events: EventContext[];
  locale: Locale;
  t: Translator;
};

export type EventHomeMetadataInput = EventMetadataBase & {
  data: EventData;
};

export type TournamentMetadataInput = EventMetadataBase & {
  tournament: Tournament;
};

export type TournamentsOverviewMetadataInput = EventMetadataBase & {
  data: EventData;
};

export type AllPlayersStatsMetadataInput = EventMetadataBase & {
  data: EventData;
};

export type PlayerStatsMetadataInput = EventMetadataBase & {
  player: PlayerStats;
  category?: string;
};

export type AllCountriesStatsMetadataInput = EventMetadataBase & {
  data: EventData;
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
  data: EventData;
};

export type CategoryWinner = {
  category: string;
  label: string;
  winner: string;
};
