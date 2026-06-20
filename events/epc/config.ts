import type { EventConfig } from '@/schema/event';

const EVENT_CONFIG: EventConfig = {
  id: 'epc',
  scope: 'european',
  domain: '',
  locales: ['en', 'pl'],
  showCountry: false,
  showBestPlace: true,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
