import Link from 'next/link';
import type { EventContext } from '@/schema/event';
import { tournamentUrl } from '@/libs/urls';

type YearLinkProps = {
  event: EventContext;
  year: string | number;
  locale: string;
};

export function YearLink({ event, year, locale }: YearLinkProps) {
  return (
    <Link
      href={tournamentUrl(event.prefix, locale, year)}
      className="underline text-event-primary hover:text-event-hover"
      prefetch={false}
    >
      {year}
    </Link>
  );
}
