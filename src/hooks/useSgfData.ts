import { skipToken, useQuery } from '@tanstack/react-query';
import { loadSgf } from '@/libs/sgf';
import { gameSgfUrl } from '@/libs/urls';

export function useSgfData(basePath: string | undefined, sgfPath?: string) {
  return useQuery({
    queryKey: ['sgf', basePath, sgfPath],
    queryFn: sgfPath
      ? async () => {
          const response = await fetch(gameSgfUrl(basePath, sgfPath));
          const content = await response.text();

          return loadSgf(content, sgfPath);
        }
      : skipToken,
    staleTime: Infinity,
    enabled: Boolean(sgfPath && typeof window !== 'undefined'),
  });
}
