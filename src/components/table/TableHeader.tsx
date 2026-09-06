import { FlexRender, type RowData } from '@tanstack/react-table';
import { SortingHeader } from '@/components/table/SortingHeader';
import type { StatsTableInstance } from '@/components/table/statsTableConfig';

type TableHeaderProps<T extends RowData> = {
  table: StatsTableInstance<T>;
};

export function TableHeader<T extends RowData>({ table }: TableHeaderProps<T>) {
  return (
    <thead className="sticky top-0 z-10 max-sm:text-sm bg-archive-page shadow-[inset_0_-1px_0_var(--color-archive-border)]">
      {table.getHeaderGroups().map((headerGroup) => (
        <tr key={headerGroup.id} className="text-center select-none">
          {headerGroup.headers.map((header) => {
            const direction = header.column.getIsSorted();

            return (
              <th
                key={header.id}
                scope="col"
                aria-sort={direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : undefined}
                className="p-1"
              >
                {header.isPlaceholder ? null : header.column.getCanSort() ? (
                  <button
                    type="button"
                    className="w-full cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-archive-focus-ring"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <FlexRender header={header} />
                    <SortingHeader header={header} />
                  </button>
                ) : (
                  <FlexRender header={header} />
                )}
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
}
