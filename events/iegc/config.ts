import type { EventConfig } from '../schema';

const EVENT_CONFIG: EventConfig = {
  id: 'iegc',
  domain: '',
  locales: ['en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: true,
  generateJpgs: true,
  generateZips: true,
  unknownRanks: ['30k'],
};

export default EVENT_CONFIG;
