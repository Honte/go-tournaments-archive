import type { Header } from '@tanstack/react-table';

export function SortingHeader<T>({ header }: { header: Header<T, unknown> }) {
  const state = header.column.getIsSorted();

  if (!state) {
    return null;
  }

  return <span className="text-xs ml-1 ">{state === 'asc' ? '▲' : '▼'}</span>;
}
