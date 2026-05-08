'use client';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { clsx } from 'clsx';
import { useLayoutEffect, useRef, useState } from 'react';
import { SortingHeader } from '@/components/table/SortingHeader';

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
          <thead className="sticky top-0 z-10 bg-event-light shadow-[inset_0_-1px_0_var(--color-event-gray)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="text-center select-none">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={clsx('p-1', {
                      'cursor-pointer': header.column.getCanSort(),
                    })}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    <SortingHeader header={header} />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {paddingTop > 0 && (
              <tr aria-hidden={true}>
                <td colSpan={columnCount} className="p-0" style={{ height: paddingTop }} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];

              return (
                <tr
                  key={row.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  className="text-center even:bg-gray-200 hover:bg-gray-300"
                >
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.columnDef.meta?.skip) {
                      return null;
                    }

                    return (
                      <td key={cell.id} className="py-1 px-2" colSpan={cell.column.columnDef.meta?.span ?? 1}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    );
                  })}
                </tr>
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
