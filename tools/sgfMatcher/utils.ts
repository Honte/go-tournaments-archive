import slugify from 'slugify';
import type { Color } from './types';

export function normalizePlayerName(name: string): string {
  return slugify(name, { lower: true, strict: true, replacement: '' });
}

export function flipColor(color: Color): Color {
  return color ? (color === 'black' ? 'white' : 'black') : undefined;
}

export function parseProps(props: string | null): Record<string, string> {
  if (!props) {
    return {};
  }

  return props
    .trim()
    .split(/\s+/)
    .reduce<Record<string, string>>((agg, prop) => {
      const pos = prop.indexOf(':');

      if (pos === -1) {
        return agg;
      }

      const key = prop.slice(0, pos);
      const value = prop.slice(pos + 1);

      if (key && value) {
        agg[key] = value;
      }

      return agg;
    }, {});
}

export function stringifyProps(props: Record<string, string | undefined | null>): string {
  const result = [];

  for (const [key, value] of Object.entries(props)) {
    if (value !== null && value !== undefined) {
      result.push(`${key}:${value}`);
    }
  }

  return result.length ? ' ' + result.join(' ') : '';
}
