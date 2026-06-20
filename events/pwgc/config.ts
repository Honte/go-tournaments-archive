import type { EventConfig } from '@/schema/event';

const EVENT_CONFIG: EventConfig = {
  id: 'pwgc',
  scope: 'national',
  domain: 'https://mpk.go.art.pl',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
};

export default EVENT_CONFIG;
