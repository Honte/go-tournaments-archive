import type { EventConfig } from '../schema';

const EVENT_CONFIG: EventConfig = {
  id: 'wgl',
  domain: '',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: false,
  generateJpgs: true,
};

export default EVENT_CONFIG;
