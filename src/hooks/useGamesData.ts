import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { fetchGames } from '@/data/api';

export function useGamesData(event: EventContext) {
  return useQuery({
    queryKey: ['games', event.basePath, event.prefix],
    queryFn: () => fetchGames(event.basePath, event.prefix),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
