'use client';

import { type RowData, type TableState } from '@tanstack/react-table';
import { type StatsColumnDef, type StatsTableFeatures, useStatsTable } from '@/components/table/statsTableConfig';
import { TableHeader } from '@/components/table/TableHeader';
import { TableRow } from './TableRow';

type StatsTableProps<T extends RowData> = {
  data: T[];
  columns: StatsColumnDef<T>[];
  initialState?: Partial<TableState<StatsTableFeatures>>;
};

export function StatsTable<T extends RowData>({ data, columns, initialState }: StatsTableProps<T>) {
  const table = useStatsTable({
    data,
    columns,
    initialState,
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <TableHeader table={table} />
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} row={row} className="even:bg-archive-row-stripe" />
          ))}
        </tbody>
      </table>
    </div>
  );
}
