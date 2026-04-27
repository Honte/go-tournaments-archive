import { useQuery } from '@tanstack/react-query';
import { type SgfMove, sgfToMoves } from '@/libs/goban';
import { getSgfRootProperties } from '@/libs/sgf';

export type SgfData = {
  size: number;
  moves: SgfMove[];
  komi?: string;
  result?: string;
};

export function useSgfData(sgf?: string) {
  return useQuery<SgfData>({
    queryKey: ['sgf', sgf],
    queryFn: async () => {
      const response = await fetch(sgf!);
      const content = await response.text();
      const rootProperties = getSgfRootProperties(content);

      return {
        size: rootProperties.SZ ? Number(rootProperties.SZ) : 19,
        moves: sgfToMoves(content),
        komi: rootProperties.KM,
        result: rootProperties.RE,
      };
    },
    staleTime: Infinity,
    enabled: Boolean(sgf && typeof window !== 'undefined'),
  });
}
