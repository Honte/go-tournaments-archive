import { EventConfig } from '@event/schema';

const EVENT_CONFIG: EventConfig = {
  id: 'mpj',
  domain: '',
  defaultLocale: 'pl',
  showCountry: false,
  showBestPlace: false,
  hideGamesWithoutSgf: true,
  generateSvgs: true,
  generateJpgs: true,
  categories: ['u21', 'u20', 'u18', 'u16', 'u15', 'u12'],
};

export default EVENT_CONFIG;
