import type { SVGProps } from 'react';
import type { Stats, Tournament } from '@/schema/data';
import type { Locale } from '@/i18n/consts';

export type EventConfig = {
  readonly id: string;
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
  readonly prefix?: string;
};

export type EventData = {
  tournaments: Tournament[];
  stats: Stats;
};

export type LogoProps = SVGProps<SVGSVGElement> & {
  mode?: 'logo' | 'favicon';
};
