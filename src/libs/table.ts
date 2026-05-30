import type { Cell } from '@tanstack/react-table';

export function toPercentage<T, V>(props: Cell<T, V>): string {
  const value = Number(props.getValue());

  return isNaN(value) || !isFinite(value) ? '–' : `${Math.round(value * 100)}%`;
}

export function toNumeric<T, V>(props: Cell<T, V>) {
  const value = Number(props.getValue());

  return isNaN(value) || !isFinite(value) ? '–' : String(value);
}
