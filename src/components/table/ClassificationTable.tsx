import type { ClassificationStage, Participant } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { isPair } from '@/libs/participants';
import { CountryLink } from '@/components/ui/CountryLink';
import { PlayerCell } from '@/components/ui/PlayerCell';

type ClassificationTableProps = {
  event: EventContext;
  stage: ClassificationStage;
  players: Record<string, Participant>;
  translations: Translations;
};

export function ClassificationTable({ event, stage, players, translations }: ClassificationTableProps) {
  const t = getTranslator(translations);
  const showRank = event.pairs && stage.table.some((result) => players[result.id].rank);
  return (
    <table className="table-auto border-separate border-spacing-x-0 border-spacing-y-0.5">
      <thead className="border-b-gray-300 border-b">
        <tr className="text-center">
          <th className="p-1">{t('table.place')}</th>
          <th className="p-1 text-left">{t('table.name')}</th>
          {showRank && <th>{t('table.pairRank')}</th>}
          {event.pairs && event.showCountry && <th>{t('table.pairCountry')}</th>}
        </tr>
      </thead>
      <tbody>
        {stage.table.map(({ id, place, index }) => {
          const player = players[id];
          const isShared = stage.table[index - 1]?.place === place;

          return (
            <tr key={id} className={index % 2 ? 'bg-archive-row-stripe' : ''}>
              <td className="p-1 text-center">{isShared ? `(${index + 1})` : place}</td>
              <td className="p-1 text-left">
                <PlayerCell
                  event={event}
                  player={player}
                  locale={translations.locale}
                  showLink={isPair(player) || player.hasStats}
                  showCountry={event.showCountry}
                  showRank={isPair(player)}
                />
              </td>
              {showRank && <td className="p-1 text-center">{player.rank}</td>}
              {event.pairs && event.showCountry && (
                <td className="p-1">
                  <CountryLink event={event} code={player.country} translations={translations} />
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
