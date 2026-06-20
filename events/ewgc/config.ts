import type { EventConfig } from '@/schema/event';

const EVENT_CONFIG: EventConfig = {
  id: 'ewgc',
  scope: 'european',
  domain: '',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
