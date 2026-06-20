import type { EventConfig } from '@/schema/event';

const EVENT_CONFIG: EventConfig = {
  id: 'pygc',
  scope: 'national',
  domain: 'https://mpj.go.art.pl',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: false,
  hideGamesWithoutSgf: true,
  generateSvgs: true,
  generateJpgs: true,
  categories: ['u21', 'u20', 'u18', 'u16', 'u15', 'u12'],
};

export default EVENT_CONFIG;
