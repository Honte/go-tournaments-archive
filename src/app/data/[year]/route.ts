import { notFound } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { loadDefaultEvent } from '@/events';
import { getTournament, getTournaments } from '@/data';

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function GET(request: NextRequest, props: PageProps) {
  const params = await props.params;
  const check = params?.year?.match(/^(\d{4})\.json(\?.+)?/);

  if (!check) {
    return notFound();
  }

  const event = await loadDefaultEvent();
  const year = Number(check[1]);
  const tournament = await getTournament(event, year);

  if (!tournament) {
    return notFound();
  }

  return Response.json(tournament);
}

export async function generateStaticParams() {
  const event = await loadDefaultEvent();
  const tournaments = await getTournaments(event);

  return tournaments.map((tournament) => ({
    year: `${tournament.year}.json`,
  }));
}
