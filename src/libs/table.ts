import type { RowData } from '@tanstack/react-table';
import type { StatsTableCell } from '@/components/table/statsTableConfig';

export function toPercentage<T extends RowData, V>(props: StatsTableCell<T, V>): string {
  const value = Number(props.getValue());

  return isNaN(value) || !isFinite(value) ? '–' : `${Math.round(value * 100)}%`;
}

export function toNumeric<T extends RowData, V>(props: StatsTableCell<T, V>) {
  const value = Number(props.getValue());

  return isNaN(value) || !isFinite(value) ? '–' : String(value);
}
