import { loadSingleEvent } from '@/events';
import { serveAllCountriesStats } from '@/routes/serveAllCountriesStats';

export const dynamic = 'force-static';

export async function GET() {
  return serveAllCountriesStats(await loadSingleEvent());
}
