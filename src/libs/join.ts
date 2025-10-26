import { ReactNode } from 'react';

export function jsxJoin(array: ReactNode[], separator: ReactNode) {
  const output = [array[0]];

  for (let i = 1; i < array.length; i++) {
    output.push(separator, array[i]);
  }

  return output;
}
