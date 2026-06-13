import type { EventConfig } from '../schema';

const EVENT_CONFIG: EventConfig = {
  id: 'kpmc',
  domain: 'https://kpmc.go.art.pl',
  locales: ['en', 'pl'],
  showCountry: true,
  showBestPlace: true,
  hideGamesWithoutSgf: true,
  generateSvgs: false,
  generateJpgs: true,
  generateZips: true,
};

export default EVENT_CONFIG;
