import { loadDefaultEvent } from '@/events';
import { getTournaments } from '@/data';

export const dynamic = 'force-static';

export async function GET() {
  const event = await loadDefaultEvent();

  return Response.json(await getTournaments(event));
}
