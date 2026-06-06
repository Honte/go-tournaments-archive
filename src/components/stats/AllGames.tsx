'use client';

import EVENT_CONFIG from '@event/config';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { ApiGameInfo } from '@/schema/api';
import type { Locale, Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Endpoints } from '@/libs/endpoints';
import { GameActions } from '@/components/GameActions';
import { StatsTable } from '@/components/table/StatsTable';
import { Loader } from '@/components/ui/Loader';
import { PlayerCell } from '@/components/ui/PlayerCell';
import { GameViewerTrigger } from '@/components/viewer/GameViewerTrigger';
import { YearLink } from '@/components/YearLink';
import { useGamesData } from '@/hooks/useGamesData';
import { useTranslationsData } from '@/hooks/useTranslationsData';

type AllGamesProps = {
  locale: Locale;
};

type AllGamesContentProps = {
  games: ApiGameInfo[];
  translations: Translations;
};

export function AllGames({ locale }: AllGamesProps) {
  const translationsData = useTranslationsData(locale);
  const gamesData = useGamesData();

  if (translationsData.isPending || gamesData.isPending) {
    return <Loader />;
  }

  if (!translationsData.data || !gamesData.data) {
    return <p>No data</p>;
  }

  return <AllGamesContent games={gamesData.data} translations={translationsData.data} />;
}

function AllGamesContent({ games, translations }: AllGamesContentProps) {
  const t = getTranslator(translations);
  const columns = useMemo<ColumnDef<ApiGameInfo>[]>(
    () =>
      (
        [
          {
            accessorKey: 'img',
            header: () => null,
            cell: (info) => {
              const game = info.row.original;

              return (
                <GameViewerTrigger sgfPath={game.sgf!}>
                  <img
                    src={Endpoints.GAME_THUMB(game.jpg!)}
                    alt={t('game.preview', `${game.black.name} vs ${game.white.name}`)}
                    className="size-20 min-w-20 min-h-20"
                    loading="lazy"
                  />
                </GameViewerTrigger>
              );
            },
            enableSorting: false,
            meta: {
              className: 'w-1/100',
            },
          },
          {
            accessorKey: 'tournament',
            header: t('table.year'),
            cell: (info) => <YearLink locale={translations.locale} year={info.cell.getValue() as number} />,
            meta: {
              className: 'w-1/100',
            },
          },
          {
            accessorKey: 'black.name',
            header: t('table.black'),
            cell: (info) => (
              <PlayerCell
                player={info.row.original.black}
                locale={translations.locale}
                includeRank={false}
                includeCountry={false}
              />
            ),
          },
          {
            accessorKey: 'black.rank',
            header: t('table.rank'),
          },
          EVENT_CONFIG.showCountry && {
            accessorKey: 'black.country',
            header: t('table.country'),
          },
          {
            accessorKey: 'white.name',
            header: t('table.white'),
            cell: (info) => (
              <PlayerCell
                player={info.row.original.white}
                locale={translations.locale}
                includeRank={false}
                includeCountry={false}
              />
            ),
          },
          {
            accessorKey: 'white.rank',
            header: t('table.rank'),
          },
          EVENT_CONFIG.showCountry && {
            accessorKey: 'white.country',
            header: t('table.country'),
          },
          {
            accessorKey: 'result',
            header: t('game.result'),
          },
          {
            accessorKey: 'moves',
            header: t('game.moves'),
          },
          {
            accessorKey: 'props',
            header: null,
            cell: (info) => <GameActions props={info.row.original} t={t} showViewer={true} />,
            enableSorting: false,
          },
        ] as ColumnDef<ApiGameInfo>[]
      ).filter(Boolean),
    [t, translations.locale]
  );

  return <StatsTable data={games} columns={columns} />;
}
