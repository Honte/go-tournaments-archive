import type { EventConfig } from '@/schema/event';

const EVENT_CONFIG: EventConfig = {
  id: 'hrgc',
  scope: 'national',
  domain: '',
  locales: ['en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: true,
  generateJpgs: true,
};

export default EVENT_CONFIG;
