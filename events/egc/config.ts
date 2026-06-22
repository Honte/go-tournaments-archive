import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'egc',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['30k'],
};

export default EVENT_CONFIG;
