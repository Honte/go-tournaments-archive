'use client';

import {
  type ColumnDef,
  type Header,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useState } from 'react';

type StatsTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
};

export function StatsTable<T>({ data, columns }: StatsTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

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

  return (
    <div className="w-full overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="border-b-gray-300 border-b">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="text-center cursor-pointer select-none">
              {headerGroup.headers.map((header) => (
                <th key={header.id} onClick={header.column.getToggleSortingHandler()} className="p-1">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  <SortingHeader header={header} />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="text-center even:bg-gray-200 hover:bg-gray-300">
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
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortingHeader<T>({ header }: { header: Header<T, unknown> }) {
  const state = header.column.getIsSorted();

  if (!state) {
    return null;
  }

  return <span className="text-xs ml-1 ">{state === 'asc' ? '▲' : '▼'}</span>;
}
