import { loadDefaultEvent } from '@/events';
import { serveAppleIconRoute } from '@/routes/icons';

export const dynamic = 'force-static';

export async function GET() {
  return serveAppleIconRoute(await loadDefaultEvent());
}
