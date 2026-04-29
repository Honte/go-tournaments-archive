import { skipToken, useQuery } from '@tanstack/react-query';
import { loadSgf } from '@/libs/sgf';

export function useSgfData(sgfPath?: string) {
  return useQuery({
    queryKey: ['sgf', sgfPath],
    queryFn: sgfPath
      ? async () => {
          const response = await fetch(sgfPath);
          const content = await response.text();

          return loadSgf(content, sgfPath);
        }
      : skipToken,
    staleTime: Infinity,
    enabled: Boolean(sgfPath && typeof window !== 'undefined'),
  });
}
