import type { EventConfig } from '@/schema/event';

const EVENT_CONFIG: EventConfig = {
  id: 'esgc',
  domain: '',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  generateSvgs: false,
  generateJpgs: false,
  generateZips: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
