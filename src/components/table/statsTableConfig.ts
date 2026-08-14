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
} from '@tanstack/react-table';

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

export const { useAppTable: useStatsTable } = createTableHook({
  features: statsTableFeatures,
});

export type StatsTableFeatures = typeof statsTableFeatures;
export type StatsColumnDef<TData extends RowData, TValue = unknown> = ColumnDef<StatsTableFeatures, TData, TValue>;
export type StatsSortFn<TData extends RowData> = SortFn<StatsTableFeatures, TData>;
export type StatsTableInstance<TData extends RowData> = Table<StatsTableFeatures, TData>;
export type StatsTableRow<TData extends RowData> = Row<StatsTableFeatures, TData>;
export type StatsTableHeader<TData extends RowData, TValue = unknown> = Header<StatsTableFeatures, TData, TValue>;
export type StatsTableCell<TData extends RowData, TValue = unknown> = Cell<StatsTableFeatures, TData, TValue>;
