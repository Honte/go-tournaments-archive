import type { EventDefinition } from '@/schema/event';

const EVENT_CONFIG: EventDefinition = {
  id: 'kpmc',
  locales: ['en', 'pl'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
