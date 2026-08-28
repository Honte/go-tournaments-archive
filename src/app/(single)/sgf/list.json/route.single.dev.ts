import { loadSingleEvent } from '@/events';
import { serveSgfList } from '@/routes/serveSgfList';

export const dynamic = 'force-static';

export async function GET() {
  return serveSgfList(await loadSingleEvent());
}
