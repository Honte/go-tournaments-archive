import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { fetchPlayerStats } from '@/data/api';

export function usePlayerStatsData(event: EventContext, slug: string) {
  const normalizedSlug = slug.toLowerCase();

  return useQuery({
    queryKey: ['stats', event.basePath, event.prefix, 'player', normalizedSlug],
    queryFn: () => fetchPlayerStats(event.basePath, event.prefix, normalizedSlug),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
