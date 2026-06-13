import type { EventConfig } from '../schema';

const EVENT_CONFIG: EventConfig = {
  id: 'pgc',
  domain: 'https://mp.go.art.pl',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: false,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
};

export default EVENT_CONFIG;
