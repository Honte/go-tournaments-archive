import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'wwomen',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  unknownRanks: ['31k'],
  categories: ['senko', 'ukai', 'wmsg', 'wwagc'],
};

export default EVENT_CONFIG;
