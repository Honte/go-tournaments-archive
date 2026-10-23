import { useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { fetchTournamentTables } from '@/data/api';

export function useTournamentTablesData(event: EventContext) {
  return useQuery({
    queryKey: ['tournament-tables', event.id],
    queryFn: () => fetchTournamentTables(event),
    staleTime: Infinity,
    enabled: typeof window !== 'undefined',
  });
}
