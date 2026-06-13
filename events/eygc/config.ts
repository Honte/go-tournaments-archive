import type { EventConfig } from '../schema';

const EVENT_CONFIG: EventConfig = {
  id: 'eygc',
  domain: '',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
  hideGamesWithoutSgf: true,
  categories: ['u21', 'u20', 'u18', 'u16', 'u12'],
};

export default EVENT_CONFIG;
