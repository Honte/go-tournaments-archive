import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { GameProps, PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { gameThumbUrl } from '@/libs/urls';
import { GameActions } from '@/components/GameActions';
import { Stone } from '@/components/Stone';
import { StatsTable } from '@/components/table/StatsTable';
import { CountryLink } from '@/components/ui/CountryLink';
import { H2 } from '@/components/ui/H2';
import { PlayerCell } from '@/components/ui/PlayerCell';
import type { PlayerDetails } from '@/components/ui/PlayerName';
import { GameViewerTrigger } from '@/components/viewer/GameViewerTrigger';
import { YearLink } from '@/components/YearLink';

type PlayerGamesProps = {
  event: EventContext;
  player: PlayerStats;
  translations: Translations;
};

type GameRow = {
  img?: string;
  year: number;
  color: 'white' | 'black';
  rank?: string;
  won: boolean;
  opponent: Omit<PlayerDetails, 'country'> & { country?: string };
  opponentFirstName: string;
  opponentLastName: string;
  result: string;
  props: GameProps;
};

export function PlayerGames({ event, player, translations }: PlayerGamesProps) {
  const t = getTranslator(translations);
  const data = useMemo(() => {
    const games: GameRow[] = [];

    for (const event of player.results) {
      for (const stage of event.stages) {
        for (const game of stage.games) {
          if (!game.props?.sgf) {
            continue;
          }

          const opponentName = player.opponents[game.id];
          const [opponentFirstName, ...rest] = opponentName.split(' ');
          const opponentLastName = rest.join(' ') || '';

          const opponent = {
            id: game.id,
            name: opponentName,
            rank: game.rank,
            country: game.country,
          };

          games.push({
            img: game.props.jpg ?? game.props.png ?? game.props.svg,
            year: event.year,
            color: game.color!,
            rank: event.rank,
            won: game.won,
            opponent,
            opponentFirstName,
            opponentLastName,
            result: game.result,
            props: game.props,
          });
        }
      }
    }

    return games.sort((a, b) => b.year - a.year);
  }, [player]);

  const columns = useMemo<ColumnDef<GameRow>[]>(
    () =>
      (
        [
          {
            accessorKey: 'img',
            header: null,
            cell: (info) => (
              <GameViewerTrigger sgfPath={info.row.original.props.sgf!}>
                <img
                  src={gameThumbUrl(event, info.row.original.img)}
                  alt={t('game.preview', `${player.name} vs ${info.row.original.opponent.name}`)}
                  className="size-20 min-w-20 min-h-20"
                  loading="lazy"
                />
              </GameViewerTrigger>
            ),
            enableSorting: false,
          },
          {
            accessorKey: 'year',
            header: t('table.year'),
            cell: (info) => (
              <YearLink event={event} locale={translations.locale} year={info.cell.getValue() as number} />
            ),
          },
          {
            accessorKey: 'rank',
            header: t('table.rank'),
          },
          {
            accessorKey: 'color',
            header: t('table.gameColor'),
            cell: (info) => <Stone color={info.row.original.color} className="size-4 mx-auto" />,
          },
          {
            accessorKey: 'won',
            header: t('table.gameWon'),
            cell: (info) => (
              <span className={info.cell.getValue() ? 'font-semibold' : ''}>{info.cell.getValue() ? '✓' : 'X'}</span>
            ),
          },
          {
            accessorKey: 'result',
            header: t('table.gameResult'),
          },
          {
            accessorKey: 'opponentFirstName',
            header: t('table.firstName'),
            cell: (info) => (
              <PlayerCell
                event={event}
                player={info.row.original.opponent}
                locale={translations.locale}
                showRank={false}
                showCountry={false}
              />
            ),
            meta: { span: 2 },
          },
          {
            accessorKey: 'opponentLastName',
            header: t('table.lastName'),
            meta: { skip: true },
          },
          event.showCountry && {
            accessorKey: 'opponent.country',
            header: t('table.country'),
            cell: (info) => (
              <CountryLink event={event} code={info.row.original.opponent.country} translations={translations} />
            ),
          },
          {
            accessorKey: 'opponent.rank',
            header: t('table.rank'),
          },
          {
            accessorKey: 'props',
            header: null,
            cell: (info) => <GameActions event={event} props={info.row.original.props} t={t} />,
            enableSorting: false,
          },
        ] as ColumnDef<GameRow>[]
      ).filter(Boolean),
    [t, player.name, translations, event]
  );

  if (!data.length) {
    return null;
  }

  return (
    <div className="my-2">
      <H2>
        {t('stats.gameRecords')} ({data.length})
      </H2>
      <StatsTable data={data} columns={columns} />
    </div>
  );
}
