import { useQuery } from '@tanstack/react-query';
import { fetchPlayerStats } from '@/data/api';

export function usePlayerStatsData(slug: string) {
  const normalizedSlug = slug.toLowerCase();

  return useQuery({
    queryKey: ['stats', 'player', normalizedSlug],
    queryFn: () => fetchPlayerStats(normalizedSlug),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
