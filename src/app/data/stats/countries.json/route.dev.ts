import { loadDefaultEvent } from '@/events';
import { getAllCountriesStats } from '@/data';

export async function GET() {
  const event = await loadDefaultEvent();

  return Response.json(await getAllCountriesStats(event));
}
