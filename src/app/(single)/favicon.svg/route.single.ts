import { loadDefaultEvent } from '@/events';
import { serveFavicon } from '@/routes/serverIcons';

export const dynamic = 'force-static';

export async function GET() {
  return serveFavicon(await loadDefaultEvent());
}
