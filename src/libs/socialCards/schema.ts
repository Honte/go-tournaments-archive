import type { StatsSummary, Tournament } from '@/schema/data';
import type { CategoryWinner, PodiumPlace } from '@/libs/metadata';

export type SocialLogoAsset = {
  src: string;
  width: number;
  height: number;
};

export type EventCardStatsInput = {
  tournaments: readonly Tournament[];
  totalStats: StatsSummary;
};

export type ArchiveCardSpec = {
  type: 'archive';
  title: string;
  subtitle: string;
  displayDomain?: string;
  eventAcronyms: string[];
  extraEventsCount: number;
};

export type GeneralCardSpec = {
  type: 'general';
  siteName: string;
  acronym: string;
  displayDomain?: string;
  subtitle: string;
  pills: string[];
};

export type EditionCardSpec = {
  type: 'edition';
  siteName: string;
  displayDomain?: string;
  heading: string;
  metaLine?: string;
  statsLine?: string;
  upcomingBadge?: string;
  podium: PodiumPlace[];
  categoryWinners: CategoryWinner[];
  isPairs: boolean;
};

export type StatsCardSpec = {
  type: 'stats';
  badge: string;
  title: string;
  subtitle: string;
  metrics: {
    value: string;
    label: string;
  }[];
};

export type GamesCardSpec = {
  type: 'games';
  badge: string;
  title: string;
  subtitle: string;
  pills: string[];
};

export type SocialCardSpec = ArchiveCardSpec | GeneralCardSpec | EditionCardSpec | StatsCardSpec | GamesCardSpec;

export type SocialRenderRequest = {
  backgroundSrc: string;
  logo: SocialLogoAsset;
  card: SocialCardSpec;
};
