import { type H9Player, buildLocalGameId } from '@/libs/h9';
import { type Color, type H9GameRecord } from './types';
import { flipColor, normalizePlayerName } from './utils';

export function buildPlayersMap(results: H9Player[]): Map<string, number> {
  const lookup = new Map<string, number>();

  for (const player of results) {
    const fullName = `${player.name} ${player.surname}`;
    const normalized = normalizePlayerName(fullName);
    if (lookup.has(normalized)) {
      console.warn(
        `  Warning: duplicate normalized name "${normalized}" (places ${lookup.get(normalized)} and ${player.place})`
      );
    }
    lookup.set(normalized, player.place);
  }

  return lookup;
}

export function buildGamesMap(results: H9Player[]): Map<string, H9GameRecord> {
  const map = new Map<string, H9GameRecord>();

  for (const player of results) {
    for (const game of player.games) {
      if (!game) {
        continue;
      }

      const myPlace = player.place;
      const opponentPlace = game.opponent;
      const myColor: Color = game.color;
      const opponentColor: Color = flipColor(game.color);
      const localId = buildLocalGameId(myPlace, opponentPlace, game.round);

      if (map.has(localId)) {
        continue;
      }

      const isHomePlayer = !myColor || myColor === 'black';

      let winnerPlace: number | null;
      if (game.result === '+') {
        winnerPlace = myPlace;
      } else if (game.result === '-') {
        winnerPlace = opponentPlace;
      } else {
        winnerPlace = null;
      }

      map.set(localId, {
        homePlace: isHomePlayer ? myPlace : opponentPlace,
        awayPlace: isHomePlayer ? opponentPlace : myPlace,
        round: game.round,
        winnerPlace,
        homeColor: isHomePlayer ? myColor : opponentColor,
        winnerColor: winnerPlace === myPlace ? myColor : opponentColor,
      });
    }
  }

  return map;
}
