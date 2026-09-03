import type { EventContext } from '@/schema/event';
import { tournamentUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';

type YearLinkProps = {
  event: EventContext;
  year: string | number;
  locale: string;
};

export function YearLink({ event, year, locale }: YearLinkProps) {
  return (
    <Link
      href={tournamentUrl(event, locale, year)}
      className="underline text-archive-link hover:text-archive-link-hover"
    >
      {year}
    </Link>
  );
}
