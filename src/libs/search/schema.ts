export type SearchOption = {
  value: string;
  label: string;
  primary: string;
  secondary?: string;
  href: string;
  gamesHref?: string;
  gamesLabel?: string;
  displayName: string;
  normalizedId: string;
  normalizedDisplayName: string;
  terms: SearchTerm[];
};

export type SearchTerm = {
  value: string;
  primary: boolean;
};
