import { type ParseArgsConfig, parseArgs } from 'node:util';

export function readCliParams<T extends ParseArgsConfig['options']>(options: T) {
  const params = parseArgs({
    options,
  });

  return params.values;
}
