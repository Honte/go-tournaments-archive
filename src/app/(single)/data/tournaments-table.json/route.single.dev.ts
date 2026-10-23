import { loadSingleEvent } from '@/events';
import { serveTournamentTables } from '@/routes/serveTournamentTables';

export const dynamic = 'force-static';

export async function GET() {
  return serveTournamentTables(await loadSingleEvent());
}
