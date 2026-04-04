import type { Tournament } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';

type AwardedProps = {
  tournament: Tournament;
  translations: Translations;
};

export function Awarded({ tournament, translations }: AwardedProps) {
  const t = getTranslator(translations);
  const { top, players } = tournament;
  const awarded = top.map((ids) => ids.split(',').map((id) => players[id]));

  return (
    <div className="flex-1">
      <H2>{t('details.awarded')}</H2>
      <ol className="list-decimal pl-5">
        {awarded.map((players, index) => (
          <li key={index} className="my-1">
            {jsxJoin(
              players.map((p) => <PlayerLink key={p.id} player={p} translations={translations} />),
              ', '
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
