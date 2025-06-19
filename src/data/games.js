const GAME_REGEX = /(?<home>[a-z]+)-(?<away>[a-z]+) (?<winner>[a-z]+)(:(?<result>[?a-zA-Z!0-9+,.:]+))?( (?<props>.+))?/i;
const GAME_RESULT_REGEX = /^(?<color>[BW])(\+(?<score>([RT?]|\d+([,.]5)?)))?$/i;

export function parseGames(repository, games) {
  const ids = [];

  for (const string of games) {
    const game = parseGame(string);
    const id = getId(repository);

    repository[id] = game;
    ids.push(id);
  }

  return ids;
}

function parseGame(string) {
  const parsed = string.match(GAME_REGEX);

  if (!parsed) {
    throw new Error(`Could not parse game ${string})`);
  }

  const { home, away, winner, result, props } = parsed.groups;

  const homePlayer = {
    id: home,
    won: winner === home
  };

  const awayPlayer = {
    id: away,
    won: winner === away
  };

  const winnerPlayer = home === winner ? homePlayer : awayPlayer;
  const loserPlayer = home === winner ? awayPlayer : homePlayer;

  if (result === '!') {
    winnerPlayer.score = '!';
  } else if (result) {
    const gameResult = result.match(GAME_RESULT_REGEX);

    if (!gameResult) {
      throw new Error(`Unrecognized game result in ${string}`);
    }

    const { color, score } = gameResult.groups;

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
    players: homePlayer.color === 'white' ? [awayPlayer, homePlayer] : [homePlayer, awayPlayer],
    result,
    props: (props?.split(' ') || [])
      .reduce((map, prop) => {
        const pos = prop.indexOf(':');
        const type = prop.slice(0, pos);
        let value = prop.slice(pos + 1);

        if (type === 'sgf') {
          value = `${process.env.SGF_URL_PREFIX}${value}`;
          map.png = value.replace('.sgf', '.png')
        }

        map[type] = value;

        return map;
      }, {})
  };
}

function getId(repository) {
  let id;

  do {
    id = Math.random().toString(36).slice(2);
  } while (id in repository);

  return id;
}
