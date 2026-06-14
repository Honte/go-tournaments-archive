import { useQuery } from '@tanstack/react-query';
import type { Locale } from '@/i18n/consts';
import { fetchTranslations } from '@/data/api';

export function useTranslationsData(basePath: string | undefined, locale: Locale) {
  return useQuery({
    queryKey: ['i18n', basePath, locale],
    queryFn: () => fetchTranslations(basePath, locale),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
