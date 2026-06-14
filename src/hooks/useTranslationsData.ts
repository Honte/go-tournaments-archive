import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import type { Locale } from '@/i18n/consts';
import { fetchTranslations } from '@/data/api';

export function useTranslationsData(event: EventContext, locale: Locale) {
  return useQuery({
    queryKey: ['i18n', event.basePath, event.prefix, locale],
    queryFn: () => fetchTranslations(event.basePath, event.prefix, locale),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
