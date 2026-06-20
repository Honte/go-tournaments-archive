import { loadDefaultEvent } from '@/events';
import { getTournamentRouteOptions, serveTournament } from '@/routes/serveTournament';

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function GET(_: Request, props: PageProps) {
  return serveTournament(await loadDefaultEvent(), (await props.params).year);
}

export async function generateStaticParams() {
  return getTournamentRouteOptions(await loadDefaultEvent());
}
