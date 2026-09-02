export type SearchEntry<T extends string | number> = [
  navigationId: T,
  displayName: string,
  ...additionalSearchTerms: string[],
];

export type TournamentSearchEntry = [
  navigationId: number,
  displayName: string,
  location: string | null,
  country: string | null,
  ...additionalSearchTerms: string[],
];

export type PlayerSearchEntry = [
  navigationId: string,
  displayName: string,
  gameCount: number,
  country: string | null,
  ...additionalSearchTerms: string[],
];

export type CountrySearchEntry = [
  navigationId: string,
  displayName: string,
  gameCount: number,
  ...additionalSearchTerms: string[],
];

export type SearchIndex = {
  tournaments: TournamentSearchEntry[];
  players: PlayerSearchEntry[];
  countries?: CountrySearchEntry[];
  categories?: SearchEntry<string>[];
};
