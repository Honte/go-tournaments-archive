import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'esgc',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
