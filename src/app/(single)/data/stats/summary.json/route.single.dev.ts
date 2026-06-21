import { loadSingleEvent } from '@/events';
import { serveEventSummary } from '@/routes/serveEventSummary';

export const dynamic = 'force-static';

export async function GET() {
  return serveEventSummary(await loadSingleEvent());
}
