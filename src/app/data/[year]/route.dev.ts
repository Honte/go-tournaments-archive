import { notFound } from 'next/navigation';
import { loadDefaultEvent } from '@/events';
import { getTournament } from '@/data';

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function GET(_: Request, props: PageProps) {
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
