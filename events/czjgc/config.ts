import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'czjgc',
  locales: ['en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['30k'],
  categories: ['u20', 'u18', 'u16', 'u15', 'u12'],
};

export default EVENT_CONFIG;
