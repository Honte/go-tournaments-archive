import fs from 'node:fs/promises';
import type { ApiGameInfo } from '@/schema/api';
import type { Game, Tournament } from '@/schema/data';
import type { EventDefinition, EventContext } from '@/schema/event';
import { CustomSgfProps, SgfRootProps } from '@/schema/sgf';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Sgf, type SgfNodeDataChange } from '@tools/sgf';
import { getStageName } from '@/libs/stage';
import pkg from '../../package.json';

export async function loadGameSgfDetails(
  event: EventDefinition,
  tournaments: Tournament[],
  sgfPath: string,
  translations: Translations
) {
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (game.props.sgf !== sgfPath) {
        continue;
      }

      return {
        props: getSgfProps(event, game, tournament, translations),
        rotation: game.rotation,
      };
    }
  }
}

export async function loadCleanTournamentSgfs(
  event: EventDefinition,
  tournament: Tournament,
  translations: Translations
) {
  const promises: Promise<{ path: string; content: string }>[] = [];

  for (const game of Object.values(tournament.games)) {
    if (!game.path || !game.props.sgf) {
      continue;
    }

    promises.push(
      fs.readFile(game.path, 'utf-8').then((content) => ({
        path: getTournamentSgfZipPath(game.props.sgf!),
        content: Sgf.clean(content, getSgfProps(event, game, tournament, translations), game.rotation),
      }))
    );
  }

  return Promise.all(promises);
}

export async function loadSgfs(tournaments: Tournament[]) {
  const games: ApiGameInfo[] = [];

  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (!game.path || !game.props.sgf) {
        continue;
      }

      const content = await fs.readFile(game.path, 'utf-8');
      const sgf = new Sgf(content);

      games.push(getGameInfo(sgf, game, tournament));
    }
  }

  return games;
}

export function getTournamentSgfZipPath(sgfPath: string) {
  const segments = sgfPath
    .replaceAll('\\', '/')
    .replace(/^\/?sgf\//, '')
    .replace(/^\/+/, '')
    .split('/')
    .filter(Boolean);

  if (segments[0]?.match(/^\d{4}$/)) {
    segments.shift();
  }

  return segments.join('-');
}

export function getGameInfo(sgf: Sgf, game: Game, tournament: Tournament): ApiGameInfo {
  const black = tournament.players[game.players[0].id];
  const white = tournament.players[game.players[1].id];
  const stage = tournament.stages[game.stage];
  const sgfKomi = sgf.getNumericRootProperty(SgfRootProps.GAME_KOMI);

  return {
    ...game.props,
    sgf: game.props.sgf!,
    tournament: tournament.year,
    stage: game.stage,
    stageName: tournament.stages.length > 1 ? stage.name : undefined,
    stageType: tournament.stages.length > 1 ? stage.type : undefined,
    category: stage?.category,
    black,
    white,
    result: game.result,
    winner: game.players[0].won ? 'black' : game.players[1].won ? 'white' : undefined,
    moves: sgf.getGameBranch().length - 1,
    komi: Number.isFinite(sgfKomi) ? sgfKomi : stage?.komi,
  };
}

export function getSgfProps(event: EventContext, game: Game, tournament: Tournament, translations: Translations) {
  const t = getTranslator(translations);
  const black = tournament.players[game.players[0].id];
  const white = tournament.players[game.players[1].id];
  const stage = tournament.stages[game.stage];
  const stageName = stage && getStageName(stage, translations);
  const roundName = stage && game.props.round ? `${game.props.round} (${stageName})` : undefined;
  const gameName = [
    `${t('site.eventName')} ${tournament.year}`,
    tournament.stages.length > 1 ? stageName : undefined,
    typeof game.props.round === 'number' ? `${t('table.round', String(game.props.round))}` : undefined,
    typeof game.props.index === 'number' ? `${t('table.game', String(game.props.index))}` : undefined,
  ]
    .filter(Boolean)
    .join(' - ');

  return {
    [SgfRootProps.ENCODING]: 'utf-8',
    [SgfRootProps.GAME_TYPE]: 1,
    [SgfRootProps.FILE_FORMAT]: 4,
    [SgfRootProps.BOARD_SIZE]: (current) => (current[0] ? Number(current[0]) : 19),
    [SgfRootProps.APPLICATION]: `${pkg.name}:${pkg.version}`,
    [SgfRootProps.EVENT_LOCATION]: tournament.country
      ? `${tournament.country},${tournament.location}`
      : tournament.location,
    [SgfRootProps.GAME_NAME]: gameName,
    [SgfRootProps.GAME_RESULT]: game.result,
    [SgfRootProps.BLACK_NAME]: black.name,
    [SgfRootProps.BLACK_RANK]: black.rank,
    [SgfRootProps.BLACK_TEAM]: (event.showCountry && black.country) || null,
    [SgfRootProps.WHITE_NAME]: white.name,
    [SgfRootProps.WHITE_RANK]: white.rank,
    [SgfRootProps.WHITE_TEAM]: (event.showCountry && white.country) || null,
    [SgfRootProps.COPYRIGHT]: null,
    [SgfRootProps.GAME_KOMI]: (current) => (current[0] ? Number(current[0]) : (stage?.komi ?? null)),
    [SgfRootProps.GAME_DATE]: (current) => current[0] ?? tournament.start?.split('-').slice(0, -1).join('-') ?? null,
    [SgfRootProps.EVENT_NAME]:
      (tournament.name && typeof tournament.name === 'object' ? tournament.name.en : tournament.name) ??
      `${t('site.acronym')} ${tournament.year}`,
    [SgfRootProps.GAME_RULES]: (current) => (current[0] ? current[0].toLowerCase() : null),
    [SgfRootProps.GAME_ROUND]: roundName || null,
    [SgfRootProps.COMMENT]: `Exported from ${t('site.name')}${event.domain ? ` (${event.domain})` : ''}`,
    [SgfRootProps.GAME_OVERTIME]: (current) => (current[0] && !current[0].match(/error/i) ? current[0] : null),

    // additional attributes for SGF Viewer
    [CustomSgfProps.BLACK_ID]: black.id,
    [CustomSgfProps.WHITE_ID]: white.id,
    [CustomSgfProps.GAME_AI]: game.props.ai || null,
    [CustomSgfProps.GAME_YT]: game.props.yt || null,
    [CustomSgfProps.GAME_OGS]: game.props.ogs || null,
  } satisfies SgfNodeDataChange;
}
