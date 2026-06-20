import Link from 'next/link';
import { loadAllEvents } from '@/events';
import { homeUrl } from '@/libs/urls';

export default async function Page() {
  const events = await loadAllEvents();

  return (
    <div className="flex flex-1 flex-col gap-2 items-center justify-center h-full">
      {events.map((event) => {
        return (
          <div key={event.id} className="text-12">
            <Link href={homeUrl(event, 'en')} className="cursor-pointer">
              {event.id}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
