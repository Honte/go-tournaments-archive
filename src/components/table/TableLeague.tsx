'use client';

import type { Game, LeagueStage, Player, TableResult } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Breaker as BreakerComponent } from '@/components/Breaker';
import { GameCell } from '@/components/GameCell';
import { GoResultsTable } from '@/components/table/GoResultsTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { PlayerLink } from '@/components/ui/PlayerLink';

type TableLeagueProps = {
  event: EventContext;
  stage: LeagueStage;
  players: Record<string, Player>;
  games: Record<string, Game>;
  translations: Translations;
};

export function TableLeague({ event, stage, players, games, translations }: TableLeagueProps) {
  const t = getTranslator(translations);
  const { breakers, columns, table, rounds, customBreakers } = stage;
  const visibleBreakers = (breakers ?? []).filter(
    (b) => b !== 'direct' && b !== 'rank' && !customBreakers?.[b]?.hidden
  );
  const categories = getCategoriesColumns(event, table);
  const hasSharedPlaces = table.some((p) => p.index !== p.place);

  return (
    <div className="w-full overflow-x-auto">
      <GoResultsTable
        className="min-w-full table-auto border-separate border-spacing-x-0 border-spacing-y-0.5"
        rearranging={stage.rounds.length < table.length - 1}
      >
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            {hasSharedPlaces && <th className="p-1">{t('table.index')}</th>}
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            <th className="p-1">{t('table.rank')}</th>
            {event.showCountry && <th className="p-1">{t('table.country')}</th>}
            {rounds.map((round, index) => (
              <th className="p-1" key={index}>
                {t('table.round', String(index + 1))}
              </th>
            ))}
            {visibleBreakers.map((breaker) => (
              <th className="p-1" key={`breaker-${breaker}`}>
                <BreakerComponent translations={translations} breaker={breaker} customBreakers={customBreakers} />
              </th>
            ))}
            {columns?.map((column) => (
              <th className="p-1" key={`column-${column}`}>
                <BreakerComponent translations={translations} breaker={column} customBreakers={customBreakers} />
              </th>
            ))}
            {categories.map((category) => (
              <th className="p-1" key={`category-${category}`}>
                {t(`categories.short.${category}`)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.map((result, i) => {
            const player = players[result.id];

            return (
              <tr key={result.id} className="text-center even:bg-gray-200 cursor-default!">
                {hasSharedPlaces && <td className="p-1">{result.index}</td>}
                <td className="p-1">{i === 0 || result.place !== table[i - 1].place ? result.place : ''}</td>
                <td className="p-1 text-left">
                  <PlayerLink
                    event={event}
                    playerId={player.hasStats ? player.id : undefined}
                    locale={translations.locale}
                  >
                    {player.name}
                  </PlayerLink>
                </td>
                <td className="p-1">{player.rank}</td>
                {event.showCountry && (
                  <td className="p-1">
                    {player.hasStats ? (
                      <CountryLink event={event} code={player.country} translations={translations} />
                    ) : (
                      player.country
                    )}
                  </td>
                )}
                {result.games.map((game, index) =>
                  game ? (
                    <GameCell as="td" key={index} entry={game} games={games} players={players} />
                  ) : (
                    <td key={index} />
                  )
                )}
                {visibleBreakers.map((breaker) => (
                  <td className="p-1" key={`breaker-${breaker}`}>
                    {result.breakers[breaker]}
                  </td>
                ))}
                {columns?.map((column) => (
                  <td className="p-1" key={`column-${column}`}>
                    {result.breakers[column] ?? ''}
                  </td>
                ))}
                {categories.map((category) => (
                  <td className="p-1" key={`category-${category}`}>
                    {getCategoryParticipationIndicator(result.categories?.[category])}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </GoResultsTable>
    </div>
  );
}

function getCategoriesColumns(event: EventContext, table: TableResult[]) {
  const usedCategories = event.categories?.filter((category) =>
    table.some((result) => result.categories?.[category] !== undefined)
  );

  return usedCategories && usedCategories.length > 1 ? usedCategories : [];
}

function getCategoryParticipationIndicator(category: number | '?' | undefined) {
  if (category === '?') {
    return '?';
  }

  return category && category > 0 ? '✓' : '';
}
