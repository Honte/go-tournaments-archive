import EVENT_CONFIG from '@event/config';
import { getTournaments } from '@/data';
import { mapValues } from 'lodash-es';
import { notFound } from 'next/navigation';
import type { NextRequest } from 'next/server';

type PageProps = {
  params: Promise<{ year: string }>;
};

export async function GET(request: NextRequest, props: PageProps) {
  const params = await props.params;
  const check = params?.year?.match(/^(\d{4})\.json(\?.+)?/);

  if (!check) {
    return notFound();
  }

  const tournaments = await getTournaments();
  const tournament = tournaments.find((t) => String(t.year) === check[1]);

  if (!tournament) {
    return notFound();
  }

  return Response.json({
    ...tournament,
    games: mapValues(tournament.games, (game) => {
      if (!game.props.sgf) {
        return game;
      }

      return {
        ...game,
        props: {
          ...game.props,
          sgf: EVENT_CONFIG.domain + game.props.sgf,
          svg: game.props.svg ? EVENT_CONFIG.domain + game.props.svg : undefined,
          png: game.props.png ? EVENT_CONFIG.domain + game.props.png : undefined,
        },
      };
    }),
  });
}

export async function generateStaticParams() {
  const tournaments = await getTournaments();

  return tournaments.map((tournament) => ({
    year: `${tournament.year}.json`,
  }));
}
