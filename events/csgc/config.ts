import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'csgc',
  locales: ['en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['30k'],
};

export default EVENT_CONFIG;
