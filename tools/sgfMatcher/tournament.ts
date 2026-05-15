import { type H9Player, buildLocalGameId } from '@/libs/h9';
import { type Color, type H9GameRecord } from './types';
import { flipColor, normalizePlayerName } from './utils';

export function buildPlayersMap(results: H9Player[]): Map<string, number> {
  const lookup = new Map<string, number>();

  for (const player of results) {
    const fullName = `${player.name} ${player.surname}`;
    registerPrimaryName(lookup, fullName, player.place);
  }

  for (const player of results) {
    const fullName = `${player.name} ${player.surname}`;
    const reversedName = `${player.surname} ${player.name}`;
    registerAliasName(lookup, reversedName, player.place, fullName);
  }

  return lookup;
}

function registerPrimaryName(lookup: Map<string, number>, name: string, place: number): void {
  const normalized = normalizePlayerName(name);

  if (lookup.has(normalized)) {
    console.warn(
      `  Warning: duplicate normalized name "${normalized}" (places ${lookup.get(normalized)} and ${place})`
    );
  }

  lookup.set(normalized, place);
}

function registerAliasName(lookup: Map<string, number>, alias: string, place: number, primaryName: string): void {
  const normalized = normalizePlayerName(alias);
  const existingPlace = lookup.get(normalized);

  if (existingPlace !== undefined) {
    if (existingPlace !== place) {
      console.warn(
        `  Warning: skipped normalized name alias "${normalized}" for "${primaryName}" (places ${existingPlace} and ${place})`
      );
    }

    return;
  }

  lookup.set(normalized, place);
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
