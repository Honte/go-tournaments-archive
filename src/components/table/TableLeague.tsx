'use client';

import EVENT_CONFIG from '@event/config';
import type { Breaker, Game, LeagueStage, Player } from '@/schema/data';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Breaker as BreakerComponent } from '@/components/Breaker';
import { CountryLink } from '@/components/ui/CountryLink';
import { GameCell } from '@/components/GameCell';
import { GoResultsTable } from '@/components/table/GoResultsTable';
import { PlayerLink } from '@/components/ui/PlayerLink';

type TableLeagueProps = {
  stage: LeagueStage;
  players: Record<string, Player>;
  games: Record<string, Game>;
  translations: Translations;
};

type NumericBreaker =
  | Breaker.WINS
  | Breaker.SOS
  | Breaker.SODOS
  | Breaker.SOSOS
  | Breaker.MMS
  | Breaker.STARTING_POSITION
  | Breaker.SCORE;

export function TableLeague({ stage, players, games, translations }: TableLeagueProps) {
  const t = getTranslator(translations);
  const { breakers, table, rounds } = stage;
  const visibleBreakers = (breakers ?? []).filter((b): b is NumericBreaker => b !== 'direct' && b !== 'rank');
  const hasSharedPlaces = table.some((p) => p.index !== p.place);

  return (
    <div className="w-full overflow-x-auto">
      <GoResultsTable
        className="min-w-full table-auto border-separate border-spacing-x-0 border-spacing-y-0.5"
        rearranging={stage.type === 'tournament'}
      >
        <thead className="border-b-gray-300 border-b">
          <tr className="text-center">
            {hasSharedPlaces && <th className="p-1">{t('table.index')}</th>}
            <th className="p-1">{t('table.place')}</th>
            <th className="p-1 text-left">{t('table.name')}</th>
            <th className="p-1">{t('table.rank')}</th>
            {EVENT_CONFIG.showCountry && <th className="p-1">{t('table.country')}</th>}
            {rounds.map((round, index) => (
              <th className="p-1" key={index}>
                {t('table.round', String(index + 1))}
              </th>
            ))}
            {visibleBreakers.map((breaker, index) => (
              <th className="p-1" key={index}>
                <BreakerComponent translations={translations} breaker={breaker} />
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
                  <PlayerLink playerId={player.id} locale={translations.locale}>
                    {player.name}
                  </PlayerLink>
                </td>
                <td className="p-1">{player.rank}</td>
                {EVENT_CONFIG.showCountry && (
                  <td className="p-1">
                    <CountryLink code={player.country} translations={translations} />
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
                  <td className="p-1" key={breaker}>
                    {result[breaker]}
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
