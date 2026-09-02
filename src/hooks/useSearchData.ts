import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { fetchSearchIndex } from '@/data/api';

export function useSearchData(event: EventContext, locale: Locale, enabled: boolean) {
  return useQuery({
    queryKey: ['search', event.id, locale],
    queryFn: () => fetchSearchIndex(event, locale),
    staleTime: Infinity,
    enabled: enabled && typeof window !== 'undefined',
    retry: 1,
  });
}
