import type { SVGProps } from 'react';
import type { EventSummary, Stats, Tournament } from '@/schema/data';
import type { Locale, LocalizedString } from '@/i18n/consts';

export type EventDefinition = {
  readonly id: string;
  readonly locales: [Locale, ...Locale[]];
  readonly showCountry?: boolean;
  readonly showBestPlace?: boolean;
  readonly hideGamesWithoutSgf?: boolean;
  readonly categories?: string[];
  readonly unknownRanks?: readonly string[];
};

export type EventConfig = {
  readonly generateJpgs?: boolean;
  readonly generatePngs?: boolean;
  readonly generateSvgs?: boolean;
  readonly generateZips?: boolean;
  readonly external?: boolean;
  readonly domain?: string;
  readonly basePath?: string;
  readonly prefix?: string;
  readonly links?: (EventLink | EventLinkGroup)[];
};

export type EventContext = EventDefinition & EventConfig;

export type ArchiveConfiguration = {
  title?: LocalizedString;
  locales?: [Locale, ...Locale[]];
  events: (EventConfiguration | EventGroup)[];
  basePath?: string;
  config?: EventConfig;
};

export type EventGroup = {
  title: LocalizedString;
  events: EventConfiguration[];
  config?: EventConfig;
};

export type EventConfiguration = EventConfig & {
  id: string;
};

export type EventLink = {
  website: LocalizedString;
  title: LocalizedString;
  tooltip?: LocalizedString;
  place?: 'top' | 'middle' | 'bottom';
};

export type EventLinkGroup = {
  title: LocalizedString;
  links: EventLink[];
};

export type EventData = {
  tournaments: Tournament[];
  stats: Stats;
  summary: EventSummary;
};

export type LogoProps = SVGProps<SVGSVGElement> & {
  mode?: 'logo' | 'favicon';
};
