import { loadEventFromPrefix } from '@/events';
import { loadEventOptions } from '@/libs/next';
import { serveSgfList } from '@/routes/serveSgfList';

type RouteProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export async function GET(_: Request, props: RouteProps) {
  const { eventId } = await props.params;
  const event = await loadEventFromPrefix(eventId);

  return serveSgfList(event);
}

export async function generateStaticParams() {
  return loadEventOptions();
}
