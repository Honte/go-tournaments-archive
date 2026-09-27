import type { RowData } from '@tanstack/react-table';
import type { TableStats } from '@/schema/data';
import type { StatsSortFn } from '@/components/table/statsTableConfig';

type PlayerLike = {
  id?: string;
  name?: string;
};

type DateRangeLike = {
  start?: string;
  end?: string;
};

export function sortTableStats(a: TableStats, b: TableStats) {
  return (
    b.gold - a.gold ||
    b.silver - a.silver ||
    b.bronze - a.bronze ||
    a.bestPlace - b.bestPlace ||
    b.attended - a.attended ||
    b.won - a.won ||
    b.games - a.games
  );
}

export function createPlayersSorter(locale: string, isDescending = false) {
  const collator = new Intl.Collator(locale);

  return function sortPlayers(a: PlayerLike, b: PlayerLike) {
    return (
      (collator.compare(getSurname(a.name ?? ''), getSurname(b.name ?? '')) ||
        collator.compare(a.name ?? '', b.name ?? '') ||
        (a.id ?? '').localeCompare(b.id ?? '')) * (isDescending ? -1 : 1)
    );
  };

  function getSurname(name: string): string {
    return name.trim().split(/\s+/).slice(1).join(' ') || name;
  }
}

export function createPodiumColumnSorter<TData extends RowData>(locale: string): StatsSortFn<TData> {
  const comparePlayers = createPlayersSorter(locale);

  return function sortPodiums(rowA, rowB, columnId) {
    const sortedA = rowA.getValue(columnId) as PlayerLike[];
    const sortedB = rowB.getValue(columnId) as PlayerLike[];

    return compareMissing(sortedA, sortedB) ?? comparePodium(sortedA, sortedB);
  };

  function comparePodium(a: PlayerLike[], b: PlayerLike[]) {
    const sortedA = a.toSorted(comparePlayers);
    const sortedB = b.toSorted(comparePlayers);

    const length = Math.min(sortedA.length, sortedB.length);
    for (let i = 0; i < length; i++) {
      const result = comparePlayers(sortedA[i], sortedB[i]);

      if (result !== 0) {
        return result;
      }
    }

    return sortedA.length - sortedB.length;
  }
}

export function createCountryColumnSorter<TData extends RowData>(
  countryLabel: (code: string) => string,
  locale: string
): StatsSortFn<TData> {
  const collator = new Intl.Collator(locale);

  return function sortCountry(rowA, rowB, columnId) {
    const a = rowA.getValue(columnId) as string | undefined;
    const b = rowB.getValue(columnId) as string | undefined;

    return compareMissing(a, b) ?? collator.compare(countryLabel(a!), countryLabel(b!));
  };
}

export function createDateRangeColumnSorter<TData extends RowData>(): StatsSortFn<TData> {
  return function sortDateRanges(rowA, rowB) {
    const a = rowA.original as DateRangeLike;
    const b = rowB.original as DateRangeLike;

    return compareMissing(a.start || a.end, b.start || b.end) ?? compareDateRanges(a, b);
  };

  function compareDateRanges(a: DateRangeLike, b: DateRangeLike) {
    const startDiff = Date.parse(a.start ?? a.end!) - Date.parse(b.start ?? b.end!);
    const endDiff = Date.parse(a.end ?? a.start!) - Date.parse(b.end ?? b.start!);

    return startDiff || endDiff;
  }
}

export function createLocaleColumnSorter<TData extends RowData>(locale: string): StatsSortFn<TData> {
  const collator = new Intl.Collator(locale);

  return function sortLocaleString(rowA, rowB, columnId) {
    const a = rowA.getValue(columnId) as string | undefined;
    const b = rowB.getValue(columnId) as string | undefined;

    return compareMissing(a, b) ?? collator.compare(a!, b!);
  };
}

function compareMissing(a: unknown, b: unknown): number | undefined {
  const aMissing = !a || (Array.isArray(a) && a.length === 0);
  const bMissing = !b || (Array.isArray(b) && b.length === 0);

  if (aMissing !== bMissing) {
    return aMissing ? 1 : -1;
  }

  return aMissing ? 0 : undefined;
}
