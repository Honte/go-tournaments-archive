import {
  type Cell,
  cellSpanningFeature,
  type ColumnDef,
  createSortedRowModel,
  createTableHook,
  type Header,
  metaHelper,
  type Row,
  type RowData,
  rowSortingFeature,
  type SortFn,
  sortFn_alphanumeric,
  sortFn_datetime,
  sortFn_text,
  type Table,
  tableFeatures,
  type TableOptions,
  type TableState,
} from '@tanstack/react-table';
import { useMemo } from 'react';

export const statsTableFeatures = tableFeatures({
  rowSortingFeature,
  cellSpanningFeature,
  sortedRowModel: createSortedRowModel(),
  columnMeta: metaHelper<{
    className?: string;
  }>(),
  sortFns: {
    alphanumeric: sortFn_alphanumeric,
    text: sortFn_text,
    datetime: sortFn_datetime,
  },
});

const { useAppTable } = createTableHook({
  features: statsTableFeatures,
});

export type StatsTableFeatures = typeof statsTableFeatures;
export type StatsColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<StatsTableFeatures, TData, TValue> & {
  enabled?: boolean;
};
export type StatsSortFn<TData extends RowData> = SortFn<StatsTableFeatures, TData>;
export type StatsTableInstance<TData extends RowData> = Table<StatsTableFeatures, TData>;
export type StatsTableRow<TData extends RowData> = Row<StatsTableFeatures, TData>;
export type StatsTableHeader<TData extends RowData, TValue = unknown> = Header<StatsTableFeatures, TData, TValue>;
export type StatsTableCell<TData extends RowData, TValue = unknown> = Cell<StatsTableFeatures, TData, TValue>;

export type UseStatsTableOptions<TData extends RowData> = Omit<
  TableOptions<StatsTableFeatures, TData>,
  'features' | 'columns'
> & {
  columns: StatsColumnDef<TData, any>[];
};

export function useStatsTable<TData extends RowData, TSelected = TableState<StatsTableFeatures>>(
  options: UseStatsTableOptions<TData>,
  selector?: (state: TableState<StatsTableFeatures>) => TSelected
) {
  const columns = useMemo(() => options.columns.filter(isEnabledColumn), [options.columns]);

  return useAppTable(
    {
      ...options,
      columns,
    },
    selector
  );
}

function isEnabledColumn<TData extends RowData, TValue = unknown>(
  column: StatsColumnDef<TData, any>
): column is ColumnDef<StatsTableFeatures, TData, TValue> {
  return column.enabled !== false;
}
