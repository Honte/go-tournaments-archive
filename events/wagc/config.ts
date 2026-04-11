import { EventConfig } from '@event/schema';

const EVENT_CONFIG: EventConfig = {
  id: 'wagc',
  domain: 'wagc.go.art.pl',
  sgfUrlPrefix: 'https://wagc.go.art.pl/sgf/',
  defaultLocale: 'en',
  showCountry: true,
  hideGamesWithoutSgf: true,
  generateSvgs: true,
};

export default EVENT_CONFIG;
