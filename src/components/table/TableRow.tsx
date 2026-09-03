import { FlexRender, type RowData } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { type ComponentProps, memo } from 'react';
import type { StatsTableRow } from '@/components/table/statsTableConfig';

type TableCellProps<T extends RowData> = ComponentProps<'tr'> & {
  row: StatsTableRow<T>;
};

export const TableRow = memo(TableRowComponent) as typeof TableRowComponent;

function TableRowComponent<T extends RowData>({ row, className, ...props }: TableCellProps<T>) {
  return (
    <tr key={row.id} className={clsx('text-center hover:bg-archive-row-hover', className)} {...props}>
      {row.getAllCells().map((cell) => {
        const colSpan = cell.getColSpan();

        if (colSpan === 0) {
          return null;
        }

        return (
          <td
            key={cell.id}
            className={clsx('py-1 px-2', cell.column.columnDef.meta?.className)}
            colSpan={cell.getColSpan()}
          >
            <FlexRender cell={cell} />
          </td>
        );
      })}
    </tr>
  );
}
