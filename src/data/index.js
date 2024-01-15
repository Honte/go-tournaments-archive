import { loadTournaments } from './load'

const tournaments = await loadTournaments();

export function getTournaments() {
  return tournaments
}

export function getTournament(year) {
  return tournaments.find((t) => t.year === Number(year))
}
