import type { EventConfig } from '@/schema/event';

const EVENT_CONFIG: EventConfig = {
  id: 'wagc',
  domain: 'https://wagc.go.art.pl',
  locales: ['en', 'pl'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
};

export default EVENT_CONFIG;
