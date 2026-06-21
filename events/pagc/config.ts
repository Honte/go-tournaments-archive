import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'pagc',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
