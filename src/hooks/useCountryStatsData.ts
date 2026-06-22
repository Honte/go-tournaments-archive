import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { fetchCountryStats } from '@/data/api';

export function useCountryStatsData(event: EventContext, code: string) {
  const normalizedCode = code.toLowerCase();

  return useQuery({
    queryKey: ['stats', event.id, 'country', normalizedCode],
    queryFn: () => fetchCountryStats(event, normalizedCode),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
