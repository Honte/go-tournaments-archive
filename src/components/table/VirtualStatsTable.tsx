'use client';

import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, useRef, useState } from 'react';
import { TableHeader } from '@/components/table/TableHeader';
import { TableRow } from './TableRow';

type VirtualStatsTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

export function VirtualStatsTable<T>({ data, columns }: VirtualStatsTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
  });

  useLayoutEffect(() => {
    scrollElementRef.current?.scrollTo({ top: 0 });
  }, [sorting]);

  const rows = table.getRowModel().rows;
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });
  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom = rowVirtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0);
  const columnCount = table.getVisibleLeafColumns().length;

  return (
    <div className="relative flex-1">
      <div ref={scrollElementRef} className="absolute inset-0 overflow-auto">
        <table className="min-w-full table-fixed border-collapse">
          <TableHeader table={table} />
          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden={true}>
                <td colSpan={columnCount} className="p-0" style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];

              return (
                <TableRow row={row} key={row.id} ref={rowVirtualizer.measureElement} data-index={virtualRow.index} />
              );
            })}
            {paddingBottom > 0 && (
              <tr aria-hidden={true}>
                <td colSpan={columnCount} className="p-0" style={{ height: paddingBottom }} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
