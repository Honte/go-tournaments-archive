import { getTournaments } from '@/data';
import { notFound } from 'next/navigation';

export async function GET(request, props) {
  const { params } = await props;
  const check = params?.year?.match(/^(\d{4})\.json(\?.+)?/);

  if (!check) {
    return notFound();
  }

  const tournaments = await getTournaments();
  const tournament = tournaments.find((t) => String(t.year) === check[1]);

  if (!tournament) {
    return notFound();
  }

  return Response.json(tournament);
}

export async function generateStaticParams() {
  const tournaments = await getTournaments();

  return tournaments.map((tournament) => ({
    year: `${tournament.year}.json`,
  }));
}
