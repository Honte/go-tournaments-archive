import { loadDefaultEvent } from '@/events';
import { getAllCountriesStats } from '@/data/serverApi';

export async function GET() {
  const event = await loadDefaultEvent();

  return Response.json(await getAllCountriesStats(event));
}
