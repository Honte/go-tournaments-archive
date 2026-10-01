import { useMemo } from 'react';
import type { GameProps, Player, PlayerStats } from '@/schema/data';
import type { EventContext } from '@/schema/event';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { getParticipantName } from '@/libs/participants';
import { gameThumbUrl } from '@/libs/urls';
import { GameActions } from '@/components/GameActions';
import { GameResultLabel } from '@/components/GameResultLabel';
import { Stone } from '@/components/Stone';
import { StatsTable } from '@/components/table/StatsTable';
import type { StatsColumnDef } from '@/components/table/statsTableConfig';
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
  partner?: Player;
  img?: string;
  year: number;
  color?: 'white' | 'black';
  rank?: string;
  won: boolean;
  drawn?: boolean;
  unresolved?: boolean;
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

          const opponentName = game.opponent ? getParticipantName(game.opponent) : player.opponents[game.id];
          const [opponentFirstName, ...rest] = opponentName.split(' ');
          const opponentLastName = rest.join(' ') || '';

          const opponent = game.opponent
            ? { ...game.opponent, name: opponentName }
            : {
                id: game.id,
                name: opponentName,
                rank: game.rank,
                country: game.country,
              };

          games.push({
            partner: event.partner,
            img: game.props.jpg ?? game.props.png ?? game.props.svg,
            year: event.year,
            color: game.color,
            rank: event.partner ? event.pairRank : event.rank,
            won: game.won,
            drawn: game.drawn,
            unresolved: game.unresolved,
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

  const columns = useMemo<StatsColumnDef<GameRow>[]>(
    () => [
      {
        accessorKey: 'img',
        header: undefined,
        cell: (info) => (
          <GameViewerTrigger sgfPath={info.row.original.props.sgf!} className="align-middle leading-none">
            <img
              src={gameThumbUrl(event, info.row.original.img)}
              alt={t('game.preview', `${player.name} vs ${info.row.original.opponent.name}`)}
              className="block size-20 min-w-20 min-h-20"
              loading="lazy"
            />
          </GameViewerTrigger>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'year',
        header: t('table.year'),
        cell: (info) => <YearLink event={event} locale={translations.locale} year={info.cell.getValue() as number} />,
      },
      {
        accessorKey: 'rank',
        header: t(event.pairs ? 'table.pairRank' : 'table.rank'),
      },
      {
        enabled: Boolean(event.pairs),
        id: 'partner',
        accessorFn: (row) => row.partner?.name,
        header: t('table.partner'),
        meta: { className: 'text-left' },
        cell: ({ row }) =>
          row.original.partner && (
            <PlayerCell event={event} locale={translations.locale} player={row.original.partner} />
          ),
      },
      {
        accessorKey: 'color',
        header: t('table.gameColor'),
        cell: (info) =>
          info.row.original.color ? <Stone color={info.row.original.color} className="size-4 mx-auto" /> : '?',
      },
      {
        accessorKey: 'won',
        header: t('table.gameWon'),
        cell: (info) => (
          <span className={info.cell.getValue() ? 'font-semibold' : ''}>
            {info.row.original.unresolved ? '?' : info.cell.getValue() ? '✓' : info.row.original.drawn ? '=' : 'X'}
          </span>
        ),
      },
      {
        accessorKey: 'result',
        header: t('table.gameResult'),
        cell: (info) => <GameResultLabel result={info.row.original.result} t={t} />,
      },
      {
        accessorKey: 'opponentFirstName',
        header: t(event.pairs ? 'table.opponentPair' : 'table.firstName'),
        meta: { className: 'text-left' },
        cell: (info) => (
          <PlayerCell
            event={event}
            player={info.row.original.opponent}
            locale={translations.locale}
            showRank={false}
            showCountry={false}
          />
        ),
        spanColumns: event.pairs ? 1 : 2,
      },
      {
        enabled: !event.pairs,
        accessorKey: 'opponentLastName',
        header: t('table.lastName'),
      },
      {
        id: 'opponentCountry',
        accessorFn: (row) => row.opponent.country,
        header: t('table.country'),
        enabled: event.showCountry,
        cell: (info) => (
          <CountryLink event={event} code={info.row.original.opponent.country} translations={translations} />
        ),
      },
      {
        id: 'opponentRank',
        accessorFn: (row) => row.opponent.rank,
        header: t(event.pairs ? 'table.pairRank' : 'table.rank'),
      },
      {
        accessorKey: 'props',
        header: undefined,
        cell: (info) => <GameActions event={event} props={info.row.original.props} t={t} />,
        enableSorting: false,
      },
    ],
    [t, player.name, translations, event]
  );

  if (!event.generateSgfs || !data.length) {
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
