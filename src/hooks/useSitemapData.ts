import { useQuery } from '@tanstack/react-query';
import type { Locale } from '@/i18n/consts';
import { fetchSitemap } from '@/data/api';

export function useSitemapData(basePath: string | undefined, locale: Locale) {
  return useQuery({
    queryKey: ['sitemap', basePath, locale],
    queryFn: () => fetchSitemap(basePath, locale),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
