import EVENT from '@event';
import EVENT_CONFIG from '@event/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { ApiGameInfo } from '@/schema/api';
import type { Game, Stage, Tournament } from '@/schema/data';
import { CustomSgfProps, SgfRootProps } from '@/schema/sgf';
import type { Translations } from '@/i18n/consts';
import { getTranslator } from '@/i18n/translator';
import { Sgf, type SgfNodeDataChange } from '@tools/sgf';
import { getStageName } from '@/libs/stage';
import pkg from '../../package.json';

const EVENT_DIR = `./events/${EVENT}`;
const SGF_DIR = `${EVENT_DIR}/sgf`;

export async function loadGameSgfDetails(tournaments: Tournament[], sgfPath: string, translations: Translations) {
  for (const tournament of tournaments) {
    for (const id in tournament.games) {
      const game = tournament.games[id];

      if (game.props.sgf !== sgfPath) {
        continue;
      }

      const stage = getGameStage(tournament, id);

      if (!stage) {
        continue;
      }

      return {
        props: getSgfProps(game, tournament, stage, translations),
        rotation: game.rotation,
      };
    }
  }
}

export async function loadCleanTournamentSgfs(tournament: Tournament, translations: Translations) {
  const promises: Promise<{ path: string; content: string }>[] = [];

  for (const game of Object.values(tournament.games)) {
    if (!game.props.sgf) {
      continue;
    }

    const stage = getGameStage(tournament, game.id);

    if (!stage) {
      continue;
    }

    promises.push(
      fs.readFile(resolveSgfFile(game.props.sgf), 'utf-8').then((content) => ({
        path: getTournamentSgfZipPath(game.props.sgf!),
        content: Sgf.clean(content, getSgfProps(game, tournament, stage, translations), game.rotation),
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

      if (!game.props.sgf) {
        continue;
      }

      const stage = getGameStage(tournament, id);

      if (!stage) {
        continue;
      }

      const content = await fs.readFile(resolveSgfFile(game.props.sgf), 'utf-8');
      const sgf = new Sgf(content);

      games.push(getGameInfo(sgf, game, tournament, stage));
    }
  }

  return games;
}

function resolveSgfFile(sgfPath: string) {
  return path.join(SGF_DIR, sgfPath.replace(/^\/sgf\/?/, ''));
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

export function getGameStage(tournament: Tournament, id: string) {
  for (const stage of tournament.stages) {
    switch (stage.type) {
      case 'tournament':
      case 'ladder-table':
      case 'league':
        for (const round of stage.rounds) {
          const gameNo = round.indexOf(id);

          if (gameNo >= 0) {
            return stage;
          }
        }
        break;
      case 'round-robin-table':
      case 'final':
        const gameNo = stage.games.indexOf(id);

        if (gameNo >= 0) {
          return stage;
        }
    }
  }

  return undefined;
}

export function getGameInfo(sgf: Sgf, game: Game, tournament: Tournament, stage: Stage): ApiGameInfo {
  const black = tournament.players[game.players[0].id];
  const white = tournament.players[game.players[1].id];

  return {
    ...game.props,
    tournament: tournament.year,
    stage: tournament.stages.indexOf(stage),
    black,
    white,
    result: game.result,
    winner: game.players[0].won ? 'black' : game.players[1].won ? 'white' : undefined,
    moves: sgf.getGameBranch().length - 1,
  };
}

export function getSgfProps(game: Game, tournament: Tournament, stage: Stage, translations: Translations) {
  const t = getTranslator(translations);
  const black = tournament.players[game.players[0].id];
  const white = tournament.players[game.players[1].id];
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
    [SgfRootProps.BLACK_TEAM]: (EVENT_CONFIG.showCountry && black.country) || null,
    [SgfRootProps.WHITE_NAME]: white.name,
    [SgfRootProps.WHITE_RANK]: white.rank,
    [SgfRootProps.WHITE_TEAM]: (EVENT_CONFIG.showCountry && white.country) || null,
    [SgfRootProps.COPYRIGHT]: null,
    [SgfRootProps.GAME_KOMI]: (current) => (current[0] ? Number(current[0]) : (stage?.komi ?? null)),
    [SgfRootProps.GAME_DATE]: (current) => current[0] ?? tournament.start?.split('-').slice(0, -1).join('-') ?? null,
    [SgfRootProps.EVENT_NAME]:
      (tournament.name && typeof tournament.name === 'object' ? tournament.name.en : tournament.name) ??
      `${t('site.acronym')} ${tournament.year}`,
    [SgfRootProps.GAME_RULES]: (current) => (current[0] ? current[0].toLowerCase() : null),
    [SgfRootProps.GAME_ROUND]: roundName || null,
    [SgfRootProps.COMMENT]: `Exported from ${t('site.name')}${EVENT_CONFIG.domain ? ` (${EVENT_CONFIG.domain})` : ''}`,
    [SgfRootProps.GAME_OVERTIME]: (current) => (current[0] && !current[0].match(/error/i) ? current[0] : null),

    // additional attributes for SGF Viewer
    [CustomSgfProps.BLACK_ID]: black.id,
    [CustomSgfProps.WHITE_ID]: white.id,
    [CustomSgfProps.GAME_AI]: game.props.ai || null,
    [CustomSgfProps.GAME_YT]: game.props.yt || null,
    [CustomSgfProps.GAME_OGS]: game.props.ogs || null,
  } satisfies SgfNodeDataChange;
}
