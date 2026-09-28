import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { fetchTournaments } from '@/data/api';

export function useTournamentsData(event: EventContext) {
  return useQuery({
    queryKey: ['tournaments', event.id],
    queryFn: () => fetchTournaments(event),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
