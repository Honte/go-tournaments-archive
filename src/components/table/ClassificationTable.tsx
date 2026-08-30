import type { ClassificationStage, Player } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

type ClassificationTableProps = {
  event: EventContext;
  stage: ClassificationStage;
  players: Record<string, Player>;
  translations: Translations;
};

export function ClassificationTable({ event, stage, players, translations }: ClassificationTableProps) {
  const t = getTranslator(translations);
  return (
    <table className="table-auto border-separate border-spacing-x-0 border-spacing-y-0.5">
      <thead className="border-b-gray-300 border-b">
        <tr className="text-center">
          <th className="p-1">{t('table.place')}</th>
          <th className="p-1 text-left">{t('table.name')}</th>
        </tr>
      </thead>
      <tbody>
        {stage.table.map(({ id, place, index }) => {
          const player = players[id];
          const isShared = stage.table[index - 1]?.place === place;

          return (
            <tr key={index} className="even:bg-archive-surface-muted hover:bg-archive-surface-hover">
              <td className="p-1 text-center">{isShared ? `(${index + 1})` : place}</td>
              <td>
                <PlayerLink
                  event={event}
                  playerId={player.hasStats ? player.id : undefined}
                  locale={translations.locale}
                  className="p-1"
                >
                  <PlayerName player={player} showCountry={event.showCountry} />
                </PlayerLink>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
