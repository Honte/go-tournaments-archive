import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'pygc',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: false,
  hideGamesWithoutSgf: true,
  categories: ['u21', 'u20', 'u18', 'u16', 'u15', 'u12'],
};

export default EVENT_CONFIG;
