import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'epgc',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['31k'],
  pairs: true,
};

export default EVENT_CONFIG;
