import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'wygc',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['31k'],
  categories: ['u18', 'u16', 'u12', 'kpmc'],
};

export default EVENT_CONFIG;
