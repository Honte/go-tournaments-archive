import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { getFormatter } from '@/i18n/formatter';
import { DEFAULT_GAME_RECORDS_STATE, type GameRecordsState } from '@/libs/gameRecords/schema';
import { serializeGameRecordsState } from '@/libs/gameRecords/urlState';
import { allGameStatsUrl } from '@/libs/urls';
import { Link } from '@/components/navigation/Link';

type SgfCountLinkProps = {
  event: EventContext;
  locale: Locale;
  count: number;
  filters: Partial<GameRecordsState>;
};

export function SgfCountLink({ event, locale, count, filters }: SgfCountLinkProps) {
  const query = serializeGameRecordsState({ ...DEFAULT_GAME_RECORDS_STATE, ...filters });
  const url = allGameStatsUrl(event, locale);

  if (!count) {
    return 0;
  }

  return (
    <Link
      className="text-archive-link underline hover:text-archive-link-hover"
      href={query.size ? `${url}?${query}` : url}
    >
      {getFormatter(locale).toCount(count)}
    </Link>
  );
}
