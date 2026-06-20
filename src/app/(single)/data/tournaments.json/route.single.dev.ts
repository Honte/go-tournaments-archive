import { loadDefaultEvent } from '@/events';
import { serveTournaments } from '@/routes/serveTournaments';

export const dynamic = 'force-static';

export async function GET() {
  return serveTournaments(await loadDefaultEvent());
}
