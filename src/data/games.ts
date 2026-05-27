import EVENT_CONFIG from '@event/config';
import type { Game, GamePlayer, GamePropsArrayKey } from '@/schema/data';
import { Sgf, type SgfRotation } from '@tools/sgf';

const ARRAY_PROPS: GamePropsArrayKey[] = ['yt'];
export const GAME_REGEX =
  /(?<home>[a-z0-9]+)-(?<away>[a-z0-9]+) (?<winner>[a-z0-9]+)(:(?<result>[?a-zA-Z!0-9+,.:]+))?( (?<props>.+))?/i;
const STRICT_GAME_RESULT_REGEX = /^(?<color>[BW])(\+(?<score>([RT?]|\d+([,.]5)?)))?$/i;
const LOOSE_GAME_RESULT_REGEX = /^(?<color>[BW])(\+(?<score>\S+))?$/i;

export function parseGames(repository: Record<string, Game>, games: string[], round?: number) {
  const ids = [];

  for (const [index, string] of games.entries()) {
    const id = getGameId(repository);
    const game = parseGame(string, id, true);

    if (round) {
      game.props.round = round;
    }

    game.props.index = index + 1;
    repository[id] = game;
    ids.push(id);
  }

  return ids;
}

export function parseGame(string: string, id: string, strict = true): Game {
  const parsed = string.match(GAME_REGEX);

  if (!parsed) {
    throw new Error(`Could not parse game ${string})`);
  }

  const { home, away, winner, result, props } = parsed.groups!;

  const homePlayer = {
    id: home,
    won: winner === home,
  } as GamePlayer;

  const awayPlayer = {
    id: away,
    won: winner === away,
  } as GamePlayer;

  const winnerPlayer = home === winner ? homePlayer : awayPlayer;
  const loserPlayer = home === winner ? awayPlayer : homePlayer;

  if (result === '!') {
    winnerPlayer.score = '!';
  } else if (result) {
    const gameResult = result.match(strict ? STRICT_GAME_RESULT_REGEX : LOOSE_GAME_RESULT_REGEX);

    if (!gameResult) {
      throw new Error(`Unrecognized game result in ${string}`);
    }

    const { color, score } = gameResult.groups!;

    winnerPlayer.score = score;

    if (color.toLowerCase() === 'b') {
      winnerPlayer.color = 'black';
      loserPlayer.color = 'white';
    } else {
      winnerPlayer.color = 'white';
      loserPlayer.color = 'black';
    }
  }

  const game: Game = {
    id,
    players: homePlayer.color === 'white' ? [awayPlayer, homePlayer] : [homePlayer, awayPlayer],
    result,
    props: {},
    rotation: 0,
  };

  if (props?.length) {
    for (const prop of props.split(' ')) {
      const pos = prop.indexOf(':');
      const type = prop.slice(0, pos);
      let value = prop.slice(pos + 1);

      if (type === 'sgf') {
        value = `/sgf/${value}`;

        if (EVENT_CONFIG.generatePngs) {
          game.props.png = value.replace('.sgf', '.png');
        }

        if (EVENT_CONFIG.generateSvgs) {
          game.props.svg = value.replace('.sgf', '.svg');
        }

        if (EVENT_CONFIG.generateJpgs) {
          game.props.jpg = value.replace('.sgf', '.jpg');
        }
      }

      if (ARRAY_PROPS.includes(type as GamePropsArrayKey) && value.indexOf(',') > 0) {
        game.props[type as GamePropsArrayKey] = value.split(',');
      } else if (type === 'round') {
        game.props.round = Number(value);
      } else if (type === 'rotate') {
        game.rotation = parseSgfRotation(value, string);
      } else {
        (game.props as Record<string, string>)[type] = value;
      }
    }
  }

  return game;
}

export function getGameId(repository: Record<string, Game>) {
  let id: string;

  do {
    id = Math.random().toString(36).slice(2);
  } while (id in repository);

  return id;
}

function parseSgfRotation(value: string, game: string): SgfRotation {
  const angle = Number(value);

  if (!Sgf.isValidRotation(angle)) {
    throw new Error(`Unrecognized SGF rotation in ${game}`);
  }

  return angle as SgfRotation;
}
