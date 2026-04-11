import { EventConfig } from '@event/schema';

const EVENT_CONFIG: EventConfig = {
  id: 'pgc',
  domain: 'mp.go.art.pl',
  sgfUrlPrefix: 'https://mp.go.art.pl/sgf/',
  defaultLocale: 'pl',
  defaultCountry: 'PL',
  generateSvgs: true,
};

export default EVENT_CONFIG;
