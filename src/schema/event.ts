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
  readonly domain?: string; // must be provided if external is true
  readonly basePath?: string; // acquired from top-level archive configuration
  readonly prefix?: string; // must be unique across configuration
  readonly links?: (EventLink | EventLinkGroup)[];
};

export type EventContext = EventDefinition & EventConfig;

export type ArchiveConfiguration = {
  title?: LocalizedString;
  locales?: [Locale, ...Locale[]];
  events: (EventConfiguration | EventGroup)[];
  basePath?: string;
  trailingSlash?: boolean;
  config?: EventConfigurationOverrides;
};

export type EventGroup = {
  title: LocalizedString;
  events: EventConfiguration[];
  config?: EventConfigurationOverrides;
};

export type EventConfiguration = Omit<EventConfig, 'basePath'> & { id: EventDefinition['id'] };
export type EventConfigurationOverrides = Omit<EventConfig, 'prefix' | 'basePath'>;

export type EventLinkPlace = 'top' | 'middle' | 'bottom';

export type EventLink = {
  website: LocalizedString;
  title: LocalizedString;
  tooltip?: LocalizedString;
  place?: EventLinkPlace;
  description?: LocalizedString;
};

export type EventLinkGroup = {
  title: LocalizedString;
  links: Omit<EventLink, 'place'>[];
  place?: EventLinkPlace;
};

export type EventData = {
  tournaments: Tournament[];
  stats: Stats;
  summary: EventSummary;
};

export type LogoProps = SVGProps<SVGSVGElement> & {
  mode?: 'logo' | 'favicon';
};
