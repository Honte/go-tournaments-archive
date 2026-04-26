import { EventConfig } from '@event/schema';

const EVENT_CONFIG: EventConfig = {
  id: 'wagc',
  domain: 'https://wagc.go.art.pl',
  defaultLocale: 'en',
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: false,
  generateJpgs: true,
};

export default EVENT_CONFIG;
