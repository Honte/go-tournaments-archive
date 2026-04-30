import { EventConfig } from '@event/schema';

const EVENT_CONFIG: EventConfig = {
  id: 'pagc',
  domain: '',
  locales: ['pl', 'en'],
  showCountry: false,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: false,
  generateJpgs: true,
};

export default EVENT_CONFIG;
