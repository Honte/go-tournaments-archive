export type EventConfig = {
  id: string;
  domain: string;
  sgfUrlPrefix: string;
  defaultLocale: string;
  defaultCountry?: string;
  showCountry?: boolean;
  generatePngs?: boolean;
  generateSvgs?: boolean;
  hideGamesWithoutSgf?: boolean;
};
