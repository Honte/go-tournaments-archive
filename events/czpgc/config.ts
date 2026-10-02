import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'czpgc',
  locales: ['en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['31k'],
  pairs: true,
};

export default EVENT_CONFIG;
