import { loadTournaments } from './load'
import { calculateStats } from '@/data/stats';

const tournaments = await loadTournaments()
const stats = calculateStats(tournaments);

export function getTournaments() {
  return tournaments
}

export function getStats() {
  return stats
}
