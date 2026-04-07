import type { TableStats } from '@/schema/data';

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
