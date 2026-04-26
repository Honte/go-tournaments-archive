import { useQuery } from '@tanstack/react-query';
import type { Locale } from '@/i18n/consts';
import { fetchTranslations } from '@/data/api';

export function useTranslationsData(locale: Locale) {
  return useQuery({
    queryKey: ['i18n', locale],
    queryFn: () => fetchTranslations(locale),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
