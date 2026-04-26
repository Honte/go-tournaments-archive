import { useQuery } from '@tanstack/react-query';
import { fetchCountryStats } from '@/data/api';

export function useCountryStatsData(code: string) {
  const normalizedCode = code.toLowerCase();

  return useQuery({
    queryKey: ['stats', 'country', normalizedCode],
    queryFn: () => fetchCountryStats(normalizedCode),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
