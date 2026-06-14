import { useQuery } from '@tanstack/react-query';
import { fetchCountryStats } from '@/data/api';

export function useCountryStatsData(basePath: string | undefined, code: string) {
  const normalizedCode = code.toLowerCase();

  return useQuery({
    queryKey: ['stats', basePath, 'country', normalizedCode],
    queryFn: () => fetchCountryStats(basePath, normalizedCode),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
