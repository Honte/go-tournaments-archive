import { loadDefaultEvent } from '@/events';
import { getAllCountriesStats } from '@/data';

export const dynamic = 'force-static';

export async function GET() {
  const event = await loadDefaultEvent();

  return Response.json(await getAllCountriesStats(event));
}
