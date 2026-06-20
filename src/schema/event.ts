import type { SVGProps } from 'react';
import type { EventSummary, Stats, Tournament } from '@/schema/data';
import type { Locale } from '@/i18n/consts';

export type EventScope = 'global' | 'european' | 'national' | 'local';

export type EventConfig = {
  readonly id: string;
  readonly scope: EventScope;
  readonly domain?: string;
  readonly locales: [Locale, ...Locale[]];
  readonly showCountry?: boolean;
  readonly showBestPlace?: boolean;
  readonly generateJpgs?: boolean;
  readonly generatePngs?: boolean;
  readonly generateSvgs?: boolean;
  readonly generateZips?: boolean;
  readonly hideGamesWithoutSgf?: boolean;
  readonly categories?: string[];
  readonly unknownRanks?: readonly string[];
};

export type EventContext = EventConfig & {
  readonly basePath?: string;
  readonly withPrefix?: boolean;
};

export type EventData = {
  tournaments: Tournament[];
  stats: Stats;
  summary: EventSummary;
};

export type LogoProps = SVGProps<SVGSVGElement> & {
  mode?: 'logo' | 'favicon';
};
