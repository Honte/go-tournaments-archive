import { useQuery } from '@tanstack/react-query';
import { fetchGames } from '@/data/api';

export function useGamesData() {
  return useQuery({
    queryKey: ['games'],
    queryFn: fetchGames,
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
