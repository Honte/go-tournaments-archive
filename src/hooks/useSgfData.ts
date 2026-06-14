import { skipToken, useQuery } from '@tanstack/react-query';
import type { EventContext } from '@/schema/event';
import { loadSgf } from '@/libs/sgf';
import { gameSgfUrl } from '@/libs/urls';

export function useSgfData(event: EventContext, sgfPath: string) {
  return useQuery({
    queryKey: ['sgf', event.basePath, event.prefix, sgfPath],
    queryFn: sgfPath
      ? async () => {
          const response = await fetch(gameSgfUrl(event.basePath, event.prefix, sgfPath));
          const content = await response.text();

          return loadSgf(content, sgfPath);
        }
      : skipToken,
    staleTime: Infinity,
    enabled: Boolean(sgfPath && typeof window !== 'undefined'),
  });
}
