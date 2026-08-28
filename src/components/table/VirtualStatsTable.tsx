'use client';

import { type RowData } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useLayoutEffect, useRef } from 'react';
import { type StatsColumnDef, useStatsTable } from '@/components/table/statsTableConfig';
import { TableHeader } from '@/components/table/TableHeader';
import { TableRow } from './TableRow';

type VirtualStatsTableProps<T extends RowData> = {
  data: T[];
  columns: StatsColumnDef<T>[];
};

export function VirtualStatsTable<T extends RowData>({ data, columns }: VirtualStatsTableProps<T>) {
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const table = useStatsTable({
    data,
    columns,
  });

  useLayoutEffect(() => {
    scrollElementRef.current?.scrollTo({ top: 0 });
  }, [table.state.sorting]);

  const rows = table.getRowModel().rows;

  // eslint-disable-next-line react/incompatible-library -- TanStack Virtual returns methods that the React Compiler cannot memoize safely.
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollElementRef.current,
    estimateSize: () => 32,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualRows[0]?.start ?? 0;
  const paddingBottom = rowVirtualizer.getTotalSize() - (virtualRows.at(-1)?.end ?? 0);
  const columnCount = table.getAllLeafColumns().length;

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
                <TableRow
                  row={row}
                  key={row.id}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
                  className={virtualRow.index % 2 === 1 ? 'bg-gray-200' : ''}
                />
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
