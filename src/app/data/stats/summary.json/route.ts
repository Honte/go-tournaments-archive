import { loadDefaultEvent } from '@/events';
import { getEventSummary } from '@/data';

export const dynamic = 'force-static';

export async function GET() {
  const event = await loadDefaultEvent();

  return Response.json(await getEventSummary(event));
}
