import { flexRender, type Row } from '@tanstack/react-table';
import type { ComponentProps } from 'react';

type TableCellProps<T> = ComponentProps<'tr'> & {
  row: Row<T>;
};

export function TableRow<T>({ row, ...props }: TableCellProps<T>) {
  return (
    <tr key={row.id} className="text-center even:bg-gray-200 hover:bg-gray-300" {...props}>
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
}
