import { loadEventFromPrefix } from '@/events';
import { loadAllOptions } from '@/libs/next';
import { getTournamentRouteOptions, serveTournament } from '@/routes/serveTournament';

type PageProps = {
  params: Promise<{
    eventId: string;
    year: string;
  }>;
};

export async function GET(_: Request, { params }: PageProps) {
  const { eventId, year } = await params;
  const event = await loadEventFromPrefix(eventId);

  return serveTournament(event, year);
}

export async function generateStaticParams() {
  return loadAllOptions(getTournamentRouteOptions);
}
