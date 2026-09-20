import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'nlkj',
  locales: ['en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['31k'],
  categories: ['u20', 'u18', 'u16', 'u12'],
};

export default EVENT_CONFIG;
