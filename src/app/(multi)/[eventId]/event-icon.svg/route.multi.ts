import { loadEventFromPrefix } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveFavicon } from '@/routes/serverIcons';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  const event = await loadEventFromPrefix(eventId);

  return serveFavicon(event);
}

export async function generateStaticParams() {
  return loadEventOptions();
}
