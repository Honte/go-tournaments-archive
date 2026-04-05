import type { CellContext } from '@tanstack/react-table';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPercentage(info: CellContext<any, number>): string {
  return `${Math.round(info.cell.getValue() * 100)}%`;
}
