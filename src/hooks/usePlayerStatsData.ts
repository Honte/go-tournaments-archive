import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { fetchPlayerStats } from '@/data/api';

export function usePlayerStatsData(event: EventContext, slug: string) {
  const normalizedSlug = slug.toLowerCase();

  return useQuery({
    queryKey: ['stats', event.id, 'player', normalizedSlug],
    queryFn: () => fetchPlayerStats(event, normalizedSlug),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
