import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'eygc',
  locales: ['en'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  categories: ['u21', 'u20', 'u18', 'u16', 'u12'],
};

export default EVENT_CONFIG;
