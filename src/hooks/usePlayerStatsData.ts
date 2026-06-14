import { useQuery } from '@tanstack/react-query';
import { fetchPlayerStats } from '@/data/api';

export function usePlayerStatsData(basePath: string | undefined, slug: string) {
  const normalizedSlug = slug.toLowerCase();

  return useQuery({
    queryKey: ['stats', basePath, 'player', normalizedSlug],
    queryFn: () => fetchPlayerStats(basePath, normalizedSlug),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
