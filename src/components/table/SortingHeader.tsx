import type { RowData } from '@tanstack/react-table';
import type { StatsTableHeader } from '@/components/table/statsTableConfig';

export function SortingHeader<T extends RowData>({ header }: { header: StatsTableHeader<T> }) {
  const state = header.column.getIsSorted();

  if (!state) {
    return null;
  }

  return <span className="text-xs ml-1 ">{state === 'asc' ? '▲' : '▼'}</span>;
}
