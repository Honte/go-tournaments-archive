import { loadEventFromPrefix } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveTournamentTables } from '@/routes/serveTournamentTables';

type RouteProps = {
  params: Promise<{ eventId: string }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  return serveTournamentTables(await loadEventFromPrefix(eventId));
}

export async function generateStaticParams() {
  return loadEventOptions();
}
