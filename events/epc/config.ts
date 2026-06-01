import { EventConfig } from '@event/schema';

const EVENT_CONFIG: EventConfig = {
  id: 'epc',
  domain: '',
  locales: ['en', 'pl'],
  showCountry: false,
  showBestPlace: true,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
  hideGamesWithoutSgf: true,
};

export default EVENT_CONFIG;
