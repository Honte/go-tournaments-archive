import { loadEventFromPrefix } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveAppleIconRoute } from '@/routes/serverIcons';

export const dynamic = 'force-static';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  const event = await loadEventFromPrefix(eventId);

  return serveAppleIconRoute(event);
}

export async function generateStaticParams() {
  return loadEventOptions();
}
