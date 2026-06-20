import { loadDefaultEvent } from '@/events';
import { serveSgfList } from '@/routes/serveSgfList';

export const dynamic = 'force-static';

export async function GET(_: Request) {
  return serveSgfList(await loadDefaultEvent());
}
