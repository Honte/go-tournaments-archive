import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '@/data/api';

export function useGamesData(basePath?: string) {
  return useQuery({
    queryKey: ['games', basePath],
    queryFn: () => fetchGames(basePath),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
