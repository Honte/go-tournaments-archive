import { Fragment } from 'react';
import type { Tournament } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { jsxJoin } from '@/libs/join';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';

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
            {awarded.map((players, index) => {
              const list = players.map((p) => (
                <PlayerCell key={p.id} event={event} player={p} locale={translations.locale} />
              ));

              return (
                <li key={index} className="my-1">
                  {players.length ? (
                    event.pairs ? (
                      <div className="flex flex-col gap-1">{list}</div>
                    ) : (
                      jsxJoin(list, ', ')
                    )
                  ) : (
                    '—'
                  )}
                </li>
              );
            })}
          </ol>
        </Fragment>
      ))}
    </div>
  );
}

function getAwarded(tournament: Tournament, categories?: string[]) {
  const { top, participants: players, categoriesTop } = tournament;

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
