export type EventConfig = {
  id: string;
  domain: string;
  defaultLocale: string;
  defaultCountry?: string;
  showCountry?: boolean;
  generatePngs?: boolean;
  generateSvgs?: boolean;
  hideGamesWithoutSgf?: boolean;
};
