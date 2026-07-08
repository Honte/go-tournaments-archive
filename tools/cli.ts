import { parseArgs } from 'node:util';
import type { ParseArgsOptionDescriptor } from 'util';

type CliParams = {
  [option: string]: ParseArgsOptionDescriptor & { positional?: boolean };
};

export function readCliParams<T extends CliParams>(config: T) {
  const options = {} as T;
  const positionals: [option: keyof T, defaultValue: ParseArgsOptionDescriptor['default']][] = [];

  for (const key in config) {
    const option = config[key];

    options[key] = option;

    if (option.positional) {
      positionals.push([key, option.default]);
    }
  }

  const allowPositionals = positionals.length > 0;
  const params = parseArgs({
    options,
    allowPositionals,
  });

  return allowPositionals
    ? {
        ...params.values,
        ...Object.fromEntries(
          positionals.map(([key, defaultValue], index) => [
            key,
            params.positionals[index] ?? params.values[key as keyof typeof params.values] ?? defaultValue,
          ])
        ),
      }
    : params.values;
}
