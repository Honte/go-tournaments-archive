import { loadEvent } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveLogo } from '@/routes/serverIcons';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, { params }: RouteProps) {
  const { eventId } = await params;
  const event = await loadEvent(eventId);

  return serveLogo(event, 'black');
}

export async function generateStaticParams() {
  return loadEventOptions();
}
