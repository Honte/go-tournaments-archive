import { TournamentDateSpan } from '@/schema/data';

export function formatDate(date: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatRange(start: Date | string, end: Date | string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).formatRange(new Date(start), new Date(end));
}

export function parseDates(date?: string | string[]): TournamentDateSpan[] {
  if (!date) {
    return [];
  }

  if (Array.isArray(date)) {
    return date.map(parseDates).flat();
  }

  if (date.includes(' - ')) {
    const [start, end] = date.split(' - ');

    return [{ start: start.trim(), end: end.trim() }];
  }

  if (date.includes(',')) {
    const [start, end] = date.split(',');

    return [{ start: start.trim(), end: end.trim() }];
  }

  return [{ start: date, end: date }];
}
