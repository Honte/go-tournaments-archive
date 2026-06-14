import type { EventContext } from '@/schema/event';
import { jsxJoin } from '@/libs/join';
import { YearLink } from '@/components/YearLink';

export function AchievementYears({ event, years, locale }: { event: EventContext; years: string[]; locale: string }) {
  return (
    <span className="text-wrap">
      {listYear(event, years.toReversed(), locale)} ({years.length})
    </span>
  );
}

function listYear(event: EventContext, years: string[], locale: string) {
  return jsxJoin(
    years.map((year, index) => <YearLink event={event} key={index} locale={locale} year={year} />),
    ', '
  );
}
