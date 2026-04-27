import { tokenize } from '@sabaki/sgf/src/tokenize';

type SgfToken = { type: string; value: string };

export function getSgfRootProperties(content: string) {
  const result: Record<string, string> = {};

  let inRoot = false;
  let currentProperty: string | undefined;

  for (const token of tokenize(content)) {
    if (token.type === 'semicolon') {
      if (inRoot) {
        break;
      }

      inRoot = true;
      continue;
    }

    if (!inRoot) {
      continue;
    }

    if (token.type === 'prop_ident') {
      currentProperty = token.value;
    } else if (token.type === 'c_value_type' && currentProperty) {
      result[currentProperty] = unescapeSgfValue(token.value.slice(1, -1));
    }
  }

  return result;
}

function getBoardSize(size?: string) {
  if (!size || !/^[1-9]\d*$/.test(size)) {
    return 19;
  }

  return Number(size);
}

function unescapeSgfValue(value: string) {
  return value.replaceAll(/\\\r?\n/g, '').replaceAll(/\\(.)/g, '$1');
}
