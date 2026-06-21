import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'epc',
  locales: ['en', 'pl'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
