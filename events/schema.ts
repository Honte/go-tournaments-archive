import type { SVGProps } from 'react';
import type { Locale } from '@/i18n/consts';

export type EventConfig = {
  readonly id: string;
  readonly domain: string;
  readonly locales: [Locale, ...Locale[]];
  readonly showCountry?: boolean;
  readonly showBestPlace?: boolean;
  readonly generateJpgs?: boolean;
  readonly generatePngs?: boolean;
  readonly generateSvgs?: boolean;
  readonly generateZips?: boolean;
  readonly hideGamesWithoutSgf?: boolean;
  readonly currentEdition?: boolean;
  readonly categories?: string[];
};

export type LogoProps = SVGProps<SVGSVGElement> & {
  mode?: 'logo' | 'favicon';
};
