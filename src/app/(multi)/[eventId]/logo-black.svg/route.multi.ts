import { loadEventFromPrefix } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveLogo } from '@/routes/serverIcons';

export const dynamic = 'force-static';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  const event = await loadEventFromPrefix(eventId);

  return serveLogo(event, 'black');
}

export async function generateStaticParams() {
  return loadEventOptions(false); // don't skip external so that we can display logos of other events
}
