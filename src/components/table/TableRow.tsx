import { flexRender, type Row } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { type ComponentProps, memo } from 'react';

type TableCellProps<T> = ComponentProps<'tr'> & {
  row: Row<T>;
};

export const TableRow = memo(TableRowComponent) as typeof TableRowComponent;

function TableRowComponent<T>({ row, className, ...props }: TableCellProps<T>) {
  return (
    <tr key={row.id} className={clsx('text-center hover:bg-gray-300', className)} {...props}>
      {row.getVisibleCells().map((cell) => {
        if (cell.column.columnDef.meta?.skip) {
          return null;
        }

        return (
          <td
            key={cell.id}
            className={clsx('py-1 px-2', cell.column.columnDef.meta?.className)}
            colSpan={cell.column.columnDef.meta?.span ?? 1}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        );
      })}
    </tr>
  );
}
