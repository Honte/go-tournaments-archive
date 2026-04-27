import { useQuery } from '@tanstack/react-query';

export type SgfData = {
  komi?: string;
};

export function useSgfData(sgf?: string) {
  return useQuery({
    queryKey: ['sgf', sgf],
    queryFn: async () => {
      if (!sgf) {
        return {};
      }

      const response = await fetch(sgf);
      const content = await response.text();
      const sgfModule = await import('@sabaki/sgf/src/tokenize');

      return {
        komi: getRootProperty(content, sgfModule.tokenize, 'KM'),
      } satisfies SgfData;
    },
    staleTime: Infinity,
    enabled: typeof window !== 'undefined' && !!sgf,
  });
}

function getRootProperty(
  content: string,
  tokenize: (content: string) => { type: string; value: string }[],
  propertyName: string
) {
  let inRoot = false;
  let currentProperty: string | undefined;

  for (const token of tokenize(content)) {
    if (token.type === 'semicolon') {
      if (inRoot) {
        return undefined;
      }

      inRoot = true;
      continue;
    }

    if (!inRoot) {
      continue;
    }

    if (token.type === 'prop_ident') {
      currentProperty = token.value;
    } else if (token.type === 'c_value_type' && currentProperty === propertyName) {
      return unescapeSgfValue(token.value.slice(1, -1));
    }
  }

  return undefined;
}

function unescapeSgfValue(value: string) {
  return value.replaceAll(/\\\r?\n/g, '').replaceAll(/\\(.)/g, '$1');
}
