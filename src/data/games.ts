import EVENT_CONFIG from '@event/config';
import type { Game, GamePlayer, GameProps, GamePropsArrayKey } from '@/schema/data';

const ARRAY_PROPS: GamePropsArrayKey[] = ['yt'];
export const GAME_REGEX =
  /(?<home>[a-z0-9]+)-(?<away>[a-z0-9]+) (?<winner>[a-z0-9]+)(:(?<result>[?a-zA-Z!0-9+,.:]+))?( (?<props>.+))?/i;
const STRICT_GAME_RESULT_REGEX = /^(?<color>[BW])(\+(?<score>([RT?]|\d+([,.]5)?)))?$/i;
const LOOSE_GAME_RESULT_REGEX = /^(?<color>[BW])(\+(?<score>\S+))?$/i;

export function parseGames(repository: Record<string, Game>, games: string[], round?: number) {
  const ids = [];

  for (const string of games) {
    const id = getGameId(repository);
    const game = parseGame(string, id, true);

    if (round) {
      game.props.round = round;
    }

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

  return {
    id,
    players: homePlayer.color === 'white' ? [awayPlayer, homePlayer] : [homePlayer, awayPlayer],
    result,
    props: (props?.split(' ') ?? ([] as string[])).reduce<GameProps>((map: GameProps, prop: string) => {
      const pos = prop.indexOf(':');
      const type = prop.slice(0, pos);
      let value = prop.slice(pos + 1);

      if (type === 'sgf') {
        value = `/sgf/${value}`;

        if (EVENT_CONFIG.generatePngs) {
          map.png = value.replace('.sgf', '.png');
        }

        if (EVENT_CONFIG.generateSvgs) {
          map.svg = value.replace('.sgf', '.svg');
        }
      }

      if (ARRAY_PROPS.includes(type as GamePropsArrayKey) && value.indexOf(',') > 0) {
        map[type as GamePropsArrayKey] = value.split(',');
      } else if (type === 'round') {
        map.round = Number(value);
      } else {
        (map as Record<string, string>)[type] = value;
      }

      return map;
    }, {}),
  };
}

export function getGameId(repository: Record<string, Game>) {
  let id: string;

  do {
    id = Math.random().toString(36).slice(2);
  } while (id in repository);

  return id;
}
