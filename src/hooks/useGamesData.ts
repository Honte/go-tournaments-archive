import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { fetchGames } from '@/data/api';

export function useGamesData(event: EventContext) {
  return useQuery({
    queryKey: ['games', event.id],
    queryFn: () => fetchGames(event),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
