import type { StatsCategory, StatsMedals } from '@/schema/data';

export type CategoryMedalist = {
  id: string;
  name: string;
  medals: StatsMedals;
};

export function getCategoryMedalists(stats: StatsCategory): CategoryMedalist[] {
  const medalists: Record<string, CategoryMedalist> = {};

  for (const tournament of stats.tournaments) {
    for (const player of tournament.results) {
      if (typeof player.place === 'number' && player.place <= 3) {
        medalists[player.id] ||= {
          id: player.id,
          name: player.name,
          medals: [[], [], []],
        };

        medalists[player.id].medals[player.place - 1].push(String(tournament.year));
      }
    }
  }

  return Object.values(medalists).sort(
    (a, b) =>
      b.medals[0].length - a.medals[0].length ||
      b.medals[1].length - a.medals[1].length ||
      b.medals[2].length - a.medals[2].length
  );
}
