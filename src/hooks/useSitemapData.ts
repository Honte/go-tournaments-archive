import { useQuery } from '@tanstack/react-query';
import type { Locale } from '@/i18n/consts';
import { fetchSitemap } from '@/data/api';

export function useSitemapData(locale: Locale) {
  return useQuery({
    queryKey: ['sitemap', locale],
    queryFn: () => fetchSitemap(locale),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
