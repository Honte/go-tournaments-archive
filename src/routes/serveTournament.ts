import { notFound } from 'next/navigation';
import type { EventContext } from '@/schema/event';
import { getTournament, getTournaments } from '@/data/serverApi';

export async function serveTournament(event: EventContext, yearParam?: string) {
  const check = yearParam?.match(/^(\d{4})\.json(\?.+)?/);

  if (!check) {
    return notFound();
  }

  const year = Number(check[1]);
  const tournament = await getTournament(event, year);

  if (!tournament) {
    return notFound();
  }

  return Response.json(tournament);
}

export async function getTournamentOptions(event: EventContext) {
  const tournaments = await getTournaments(event);

  return tournaments.map((tournament) => ({
    year: `${tournament.year}.json`,
  }));
}
