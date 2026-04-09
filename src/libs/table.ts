import type { CellContext } from '@tanstack/react-table';

export function toPercentage(info: CellContext<any, number>): string {
  return `${Math.round(info.cell.getValue() * 100)}%`;
}
