import { loadDefaultEvent } from '@/events';
import { getEventSummary } from '@/data/serverApi';

export async function GET() {
  const event = await loadDefaultEvent();

  return Response.json(await getEventSummary(event));
}
