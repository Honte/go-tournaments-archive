import type { Translator } from '@/i18n/consts';
import type { SearchDestination, SearchEntity } from '@/libs/search';

export type SearchOption = {
  value: string;
  label: string;
  primary: string;
  secondary?: string;
  href: string;
  gamesHref?: string;
  gamesLabel?: string;
};

export function createOption(entity: SearchEntity, destinations: SearchDestination[], t: Translator): SearchOption {
  const country = entity.country ? ` (${entity.country})` : '';
  const destination = destinations[0];
  const gamesDestination = destinations.find(({ kind }) => kind === 'player-games' || kind === 'country-games');
  let primary: string;
  let secondary: string | undefined;

  switch (entity.type) {
    case 'player':
      primary = `${entity.displayName}${country}`;
      secondary = t('search.types.player');
      break;
    case 'tournament':
      primary = entity.displayName ? `${entity.navigationId}, ${entity.displayName}` : String(entity.navigationId);
      secondary =
        [t('search.types.tournament'), entity.location, entity.countryName ?? entity.country]
          .filter(Boolean)
          .join(', ') || undefined;
      break;
    case 'country':
      primary = `${entity.displayName}${country}`;
      secondary = t('search.types.country');
      break;
    case 'category':
      primary = entity.displayName;
      secondary = t('search.types.category');
      break;
  }

  return {
    value: entity.key,
    label: [primary, secondary, gamesDestination && t('search.games', String(entity.gameCount ?? 0))]
      .filter(Boolean)
      .join(' '),
    primary,
    secondary,
    href: destination.href,
    gamesHref: gamesDestination?.href,
    gamesLabel: gamesDestination ? t('search.games', String(entity.gameCount ?? 0)) : undefined,
  };
}
