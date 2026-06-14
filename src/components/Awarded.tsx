import { Fragment } from 'react';
import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { H2 } from '@/components/ui/H2';
import { PlayerLink } from '@/components/ui/PlayerLink';
import { PlayerName } from '@/components/ui/PlayerName';

type AwardedProps = {
  event: EventContext;
  tournament: Tournament;
  translations: Translations;
};

export function Awarded({ event, tournament, translations }: AwardedProps) {
  const t = getTranslator(translations);
  const awarded = getAwarded(tournament, event.categories);

  return (
    <div className="flex-1 flex flex-col">
      {awarded.map(({ category, awarded }, index) => (
        <Fragment key={index}>
          <H2>{category ? t('details.awardedIn', t(`categories.short.${category}`)) : t('details.awarded')}</H2>
          <ol className="list-decimal pl-5">
            {awarded.map((players, index) => (
              <li key={index} className="my-1">
                {jsxJoin(
                  players.map((p) => (
                    <PlayerLink key={p.id} event={event} playerId={p.id} locale={translations.locale}>
                      <PlayerName player={p} showCountry={event.showCountry} />
                    </PlayerLink>
                  )),
                  ', '
                )}
              </li>
            ))}
          </ol>
        </Fragment>
      ))}
    </div>
  );
}

function getAwarded(tournament: Tournament, categories?: string[]) {
  const { top, players, categoriesTop } = tournament;

  if (categories?.length && categoriesTop) {
    return Object.entries(categoriesTop).map(([category, top]) => ({
      category,
      awarded: top.map((ids) => ids.map((id) => players[id])),
    }));
  }

  return [
    {
      category: undefined,
      awarded: top.map((ids) => ids.map((id) => players[id])),
    },
  ];
}
