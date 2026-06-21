import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'pgc',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: false,
};

export default EVENT_CONFIG;
