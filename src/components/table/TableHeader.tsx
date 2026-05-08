import { flexRender, type Table } from '@tanstack/react-table';
import { clsx } from 'clsx';
import { SortingHeader } from '@/components/table/SortingHeader';

type TableHeaderProps<T> = {
  table: Table<T>;
};

export function TableHeader<T>({ table }: TableHeaderProps<T>) {
  return (
    <thead className="sticky top-0 z-10 max-sm:text-sm bg-event-light shadow-[inset_0_-1px_0_var(--color-event-gray)]">
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
  );
}
