import { loadSingleEvent } from '@/events';
import { serveAppleIconRoute } from '@/routes/serverIcons';

export const dynamic = 'force-static';

export async function GET() {
  return serveAppleIconRoute(await loadSingleEvent());
}
