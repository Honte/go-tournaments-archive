import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { fetchSitemap } from '@/data/api';

export function useSitemapData(event: EventContext, locale: Locale) {
  return useQuery({
    queryKey: ['sitemap', event.id, locale],
    queryFn: () => fetchSitemap(event, locale),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
