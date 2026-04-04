import type { CellContext } from '@tanstack/react-table';
import type { Translations } from '@/i18n/consts';
import { PlayerLink } from '@/components/ui/PlayerLink';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function toPercentage(info: CellContext<any, number>): string {
  return `${Math.round(info.cell.getValue() * 100)}%`;
}

export function toPlayerLink<T extends { id: string; name?: string }>(
  info: CellContext<T, unknown>,
  translations: Translations
) {
  return (
    <div className="text-left">
      <PlayerLink player={info.row.original} translations={translations} />
    </div>
  );
}
