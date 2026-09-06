import { deburr } from 'lodash-es';

export function normalizeSearchText(value?: string) {
  if (!value) {
    return '';
  }

  return deburr(value.toLocaleLowerCase())
    .normalize('NFKD')
    .replace(/\p{Mark}/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim();
}

export function tokenizeSearchText(value?: string) {
  const normalized = normalizeSearchText(value);

  return normalized ? normalized.split(' ') : [];
}
