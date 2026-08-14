'use client';

import { type RowData } from '@tanstack/react-table';
import { type StatsColumnDef, useStatsTable } from '@/components/table/statsTableConfig';
import { TableHeader } from '@/components/table/TableHeader';
import { TableRow } from './TableRow';

type StatsTableProps<T extends RowData> = {
  data: T[];
  columns: StatsColumnDef<T>[];
};

export function StatsTable<T extends RowData>({ data, columns }: StatsTableProps<T>) {
  const table = useStatsTable({
    data,
    columns,
  });

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <TableHeader table={table} />
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} row={row} className="even:bg-gray-200" />
          ))}
        </tbody>
      </table>
    </div>
  );
}
