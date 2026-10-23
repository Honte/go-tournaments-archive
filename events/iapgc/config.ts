import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'iapgc',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['31k'],
  pairs: true,
  categories: ['iapgc', 'wspgc', 'wmsg'],
};

export default EVENT_CONFIG;
