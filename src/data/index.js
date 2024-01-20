import { loadTournaments } from './load'
import { calculateStats } from '@/data/stats';

export function getTournaments() {
  return loadTournaments()
}

export function getStats() {
  return loadTournaments().then(calculateStats)
}
