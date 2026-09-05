import { deburr } from 'lodash-es';
import type { EventContext } from '@/schema/event';
import type { SearchEntry, SearchIndex } from '@/schema/search';
import {
  allGameStatsForCountryUrl,
  allGameStatsForPlayerUrl,
  categoryUrl,
  countryUrl,
  playerUrl,
  tournamentUrl,
} from '@/libs/urls';

export type SearchEntityType = 'tournament' | 'player' | 'country' | 'category';

export type SearchEntity = {
  key: string;
  type: SearchEntityType;
  navigationId: string | number;
  displayName: string;
  normalizedId: string;
  normalizedDisplayName: string;
  terms: SearchTerm[];
  gameCount?: number;
  country?: string;
  countryName?: string;
  location?: string;
};

export type SearchResult = SearchEntity & { score: number };

export type SearchDestination = {
  kind: SearchEntityType | 'player-games' | 'country-games';
  href: string;
};

type SearchTerm = {
  value: string;
  primary: boolean;
};

export function normalizeSearchText(value?: string) {
  if (!value) {
    return '';
  }

  return deburr(value.toLocaleLowerCase())
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

export function tokenizeSearchText(value?: string) {
  const normalized = normalizeSearchText(value);

  return normalized ? normalized.split(' ') : [];
}

export function prepareSearchEntities(index: SearchIndex): SearchEntity[] {
  const result: SearchEntity[] = [];
  const countriesByCode = new Map<string, { displayName: string; terms: SearchTerm[] }>();

  for (const [entryIndex, entry] of (index.countries ?? []).entries()) {
    const [navigationId, displayName, gameCount, ...additional] = entry;
    const terms = getSearchTerms(navigationId, displayName, additional);
    const countryEntity = createEntity('country', navigationId, displayName, entryIndex, terms, {
      gameCount,
      country: navigationId,
    });

    countriesByCode.set(countryEntity.normalizedId, {
      displayName,
      terms,
    });
    result.push(countryEntity);
  }

  for (const [entryIndex, entry] of index.tournaments.entries()) {
    const [navigationId, displayName, location, country, ...additional] = entry;
    const terms = getSearchTerms(navigationId, displayName, [location, country, ...additional]);
    const countryEntry = country ? countriesByCode.get(normalizeSearchText(country)) : undefined;

    if (countryEntry) {
      mergeTerms(terms, countryEntry.terms, false);
    }

    result.push(
      createEntity('tournament', navigationId, displayName, entryIndex, terms, {
        country: country ?? undefined,
        countryName: countryEntry?.displayName,
        location: location ?? undefined,
      })
    );
  }

  for (const [entryIndex, entry] of index.players.entries()) {
    const [navigationId, displayName, gameCount, country, ...additional] = entry;
    const terms = getSearchTerms(navigationId, displayName, country ? [country, ...additional] : additional);
    const countryEntry = country ? countriesByCode.get(normalizeSearchText(country)) : undefined;

    if (countryEntry) {
      mergeTerms(terms, countryEntry.terms, false);
    }

    result.push(
      createEntity('player', navigationId, displayName, entryIndex, terms, {
        gameCount,
        country: country ?? undefined,
      })
    );
  }

  for (const [entryIndex, entry] of (index.categories ?? []).entries()) {
    result.push(createEntityFromEntry('category', entry, entryIndex));
  }

  return result;
}

export function findSearchResults(entities: SearchEntity[], query: string, locale: string, limit = 20): SearchResult[] {
  const normalizedQuery = normalizeSearchText(query);
  const queryTerms = normalizedQuery.split(' ');

  if (!normalizedQuery) {
    return [];
  }

  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });

  return entities
    .map((entity) => {
      const score = scoreEntity(entity, normalizedQuery, queryTerms);

      return score === undefined ? undefined : { ...entity, score };
    })
    .filter((entity): entity is SearchResult => Boolean(entity))
    .toSorted(
      (a, b) => a.score - b.score || collator.compare(a.displayName, b.displayName) || a.key.localeCompare(b.key)
    )
    .slice(0, limit);
}

export function getSearchDestinations(entity: SearchEntity, event: EventContext, locale: string): SearchDestination[] {
  const id = String(entity.navigationId);

  switch (entity.type) {
    case 'tournament':
      return [{ kind: 'tournament', href: tournamentUrl(event, locale, id) }];
    case 'player':
      return [
        { kind: 'player', href: playerUrl(event, locale, id) },
        ...(entity.gameCount
          ? [{ kind: 'player-games' as const, href: allGameStatsForPlayerUrl(event, locale, id) }]
          : []),
      ];
    case 'country':
      return [
        { kind: 'country', href: countryUrl(event, locale, id) },
        ...(entity.gameCount
          ? [{ kind: 'country-games' as const, href: allGameStatsForCountryUrl(event, locale, id) }]
          : []),
      ];
    case 'category':
      return [{ kind: 'category', href: categoryUrl(event, locale, id) }];
  }
}

function createEntityFromEntry<T extends string | number>(
  type: SearchEntityType,
  entry: SearchEntry<T>,
  index: number
): SearchEntity {
  return createEntity(type, entry[0], entry[1], index, getEntryTerms(entry));
}

function createEntity<T extends string | number>(
  type: SearchEntityType,
  navigationId: T,
  displayName: string,
  index: number,
  terms: SearchTerm[],
  details: Pick<SearchEntity, 'gameCount' | 'country' | 'countryName' | 'location'> = {}
): SearchEntity {
  return {
    key: `${type}:${navigationId}:${index}`,
    type,
    navigationId,
    displayName,
    normalizedId: normalizeSearchText(String(navigationId)),
    normalizedDisplayName: normalizeSearchText(displayName),
    terms,
    ...details,
  };
}

function getEntryTerms(entry: SearchEntry<string | number>) {
  return getSearchTerms(entry[0], entry[1], entry.slice(2).map(String));
}

function getSearchTerms(navigationId: string | number, displayName: string, additional: (string | null)[]) {
  const terms: SearchTerm[] = [];

  mergeTerms(
    terms,
    [
      ...tokenizeSearchText(String(navigationId)).map((value) => ({ value, primary: true })),
      ...tokenizeSearchText(displayName).map((value) => ({ value, primary: true })),
      ...additional.flatMap((phrase) =>
        tokenizeSearchText(phrase ?? undefined).map((value) => ({ value, primary: false }))
      ),
    ],
    true
  );

  return terms;
}

function mergeTerms(target: SearchTerm[], source: SearchTerm[], preservePriority: boolean) {
  for (const term of source) {
    const existing = target.find((candidate) => candidate.value === term.value);

    if (!existing) {
      target.push({ value: term.value, primary: preservePriority && term.primary });
    } else if (preservePriority && term.primary) {
      existing.primary = true;
    }
  }
}

function scoreEntity(entity: SearchEntity, normalizedQuery: string, queryTerms: string[]) {
  if (entity.normalizedId === normalizedQuery) {
    return -200;
  }

  if (entity.normalizedDisplayName === normalizedQuery) {
    return -100;
  }

  if (entity.normalizedDisplayName.startsWith(normalizedQuery)) {
    return -50;
  }

  let score = 0;

  for (const queryTerm of queryTerms) {
    let best: number | undefined;

    for (const term of entity.terms) {
      const next = scoreTerm(queryTerm, term);

      if (next !== undefined && (best === undefined || next < best)) {
        best = next;
      }
    }

    if (best === undefined) {
      return undefined;
    }

    score += best;
  }

  return score;
}

function scoreTerm(query: string, term: SearchTerm) {
  const priority = term.primary ? 0 : 1;

  if (term.value === query) {
    return priority;
  }

  if (term.value.startsWith(query)) {
    return 10 + priority + Math.min(5, term.value.length - query.length);
  }

  const substringIndex = term.value.indexOf(query);

  if (substringIndex >= 0) {
    return 20 + priority + Math.min(5, substringIndex);
  }

  const maxDistance = query.length >= 8 ? 2 : query.length >= 4 ? 1 : 0;

  if (!maxDistance) {
    return undefined;
  }

  const distance = editDistanceWithin(query, term.value, maxDistance);

  return distance === undefined ? undefined : 30 + priority + distance * 5;
}

function editDistanceWithin(left: string, right: string, maximum: number) {
  if (Math.abs(left.length - right.length) > maximum) {
    return undefined;
  }

  let previous = Array.from({ length: right.length + 1 }, (_, index) => index);

  for (let leftIndex = 1; leftIndex <= left.length; leftIndex++) {
    const current = [leftIndex];
    let rowMinimum = current[0];

    for (let rightIndex = 1; rightIndex <= right.length; rightIndex++) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      const value = Math.min(previous[rightIndex] + 1, current[rightIndex - 1] + 1, substitution);

      current.push(value);
      rowMinimum = Math.min(rowMinimum, value);
    }

    if (rowMinimum > maximum) {
      return undefined;
    }

    previous = current;
  }

  return previous[right.length] <= maximum ? previous[right.length] : undefined;
}
