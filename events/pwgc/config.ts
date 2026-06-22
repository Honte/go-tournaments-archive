import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'pwgc',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
