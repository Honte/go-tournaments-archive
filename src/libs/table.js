import { PlayerLink } from '@/components/ui/PlayerLink';

export function toPercentage(info) {
  return `${Math.round(info.cell.getValue() * 100)}%`;
}

export function toPlayerLink(info, translations) {
  return (
    <div className="text-left">
      <PlayerLink player={info.row.original} translations={translations} />
    </div>
  );
}
