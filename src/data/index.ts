import { calculateStats } from '@/data/stats';
import { loadTournaments } from './load';

const tournaments = await loadTournaments();
const stats = calculateStats(tournaments);

export function getTournaments() {
  return tournaments;
}

export function getStats() {
  return stats;
}
