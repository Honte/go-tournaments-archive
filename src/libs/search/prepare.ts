import type { EventContext } from '@/schema/event';
import type { SearchIndex } from '@/schema/search';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import {
  allGameStatsForCountryUrl,
  allGameStatsForPlayerUrl,
  categoryUrl,
  countryUrl,
  playerUrl,
  tournamentUrl,
} from '@/libs/urls';
import { normalizeSearchText, tokenizeSearchText } from './normalize';
import type { SearchOption, SearchTerm } from './schema';

export function prepareSearchOptions(
  index: SearchIndex,
  event: EventContext,
  translations: Translations
): SearchOption[] {
  const result: SearchOption[] = [];
  const countriesByCode = new Map<string, { displayName: string; terms: SearchTerm[] }>();
  const t = getTranslator(translations);
  const locale = translations.locale;

  for (const [entryIndex, entry] of (index.countries ?? []).entries()) {
    const [navigationId, displayName, gameCount, ...additional] = entry;
    const terms = getSearchTerms(navigationId, displayName, additional);
    const option = createOption(`country:${navigationId}:${entryIndex}`, navigationId, displayName, terms, {
      primary: `${displayName}${navigationId ? ` (${navigationId})` : ''}`,
      secondary: t('search.types.country'),
      href: countryUrl(event, locale, navigationId),
      gamesHref: gameCount ? allGameStatsForCountryUrl(event, locale, navigationId) : undefined,
      gamesLabel: gameCount ? t('search.games', String(gameCount)) : undefined,
    });

    countriesByCode.set(option.normalizedId, { displayName, terms });
    result.push(option);
  }

  for (const [entryIndex, entry] of index.tournaments.entries()) {
    const [navigationId, displayName, location, country, ...additional] = entry;
    const terms = getSearchTerms(navigationId, displayName, [location, country, ...additional]);
    const countryEntry = country ? countriesByCode.get(normalizeSearchText(country)) : undefined;

    if (countryEntry) {
      mergeTerms(terms, countryEntry.terms, false);
    }

    result.push(
      createOption(`tournament:${navigationId}:${entryIndex}`, navigationId, displayName, terms, {
        primary: displayName ? `${navigationId}, ${displayName}` : String(navigationId),
        secondary:
          [t('search.types.tournament'), location, countryEntry?.displayName ?? country].filter(Boolean).join(', ') ||
          undefined,
        href: tournamentUrl(event, locale, navigationId),
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
      createOption(`player:${navigationId}:${entryIndex}`, navigationId, displayName, terms, {
        primary: `${displayName}${country ? ` (${country})` : ''}`,
        secondary: t('search.types.player'),
        href: playerUrl(event, locale, navigationId),
        gamesHref: gameCount ? allGameStatsForPlayerUrl(event, locale, navigationId) : undefined,
        gamesLabel: gameCount ? t('search.games', String(gameCount)) : undefined,
      })
    );
  }

  for (const [entryIndex, entry] of (index.categories ?? []).entries()) {
    const [navigationId, displayName, ...additional] = entry;

    result.push(
      createOption(
        `category:${navigationId}:${entryIndex}`,
        navigationId,
        displayName,
        getSearchTerms(navigationId, displayName, additional),
        {
          primary: displayName,
          secondary: t('search.types.category'),
          href: categoryUrl(event, locale, navigationId),
        }
      )
    );
  }

  return result;
}

function createOption(
  value: string,
  navigationId: string | number,
  displayName: string,
  terms: SearchTerm[],
  content: Pick<SearchOption, 'primary' | 'secondary' | 'href' | 'gamesHref' | 'gamesLabel'>
): SearchOption {
  return {
    value,
    label: [content.primary, content.secondary, content.gamesLabel].filter(Boolean).join(' '),
    ...content,
    displayName,
    normalizedId: normalizeSearchText(String(navigationId)),
    normalizedDisplayName: normalizeSearchText(displayName),
    terms,
  };
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
