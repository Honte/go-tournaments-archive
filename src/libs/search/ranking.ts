import { normalizeSearchText } from './normalize';
import type { SearchOption, SearchTerm } from './types';

export function findSearchResults(options: SearchOption[], query: string, locale: string, limit = 20): SearchOption[] {
  const normalizedQuery = normalizeSearchText(query);
  const queryTerms = normalizedQuery.split(' ');

  if (!normalizedQuery) {
    return [];
  }

  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' });

  return options
    .map((option) => ({ option, score: scoreOption(option, normalizedQuery, queryTerms) }))
    .filter((result): result is { option: SearchOption; score: number } => result.score !== undefined)
    .toSorted(
      (a, b) =>
        a.score - b.score ||
        collator.compare(a.option.displayName, b.option.displayName) ||
        a.option.value.localeCompare(b.option.value)
    )
    .slice(0, limit)
    .map(({ option }) => option);
}

function scoreOption(option: SearchOption, normalizedQuery: string, queryTerms: string[]) {
  if (option.normalizedId === normalizedQuery) {
    return -200;
  }

  if (option.normalizedDisplayName === normalizedQuery) {
    return -100;
  }

  if (option.normalizedDisplayName.startsWith(normalizedQuery)) {
    return -50;
  }

  let score = 0;

  for (const queryTerm of queryTerms) {
    let best: number | undefined;

    for (const term of option.terms) {
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
