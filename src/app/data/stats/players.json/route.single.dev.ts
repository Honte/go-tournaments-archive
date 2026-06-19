import { loadDefaultEvent } from '@/events';
import { serveAllPlayersStats } from '@/routes/serveAllPlayersStats';

export const dynamic = 'force-static';

export async function GET() {
  return serveAllPlayersStats(await loadDefaultEvent());
}
