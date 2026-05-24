import type { H9Player } from '@/libs/h9';

export function makeH9Player({ place, name, surname }: { place: number; name: string; surname: string }): H9Player {
  return {
    place,
    name,
    surname,
    rank: '1d',
    country: 'XX',
    club: 'xxx',
    games: [],
    scores: [],
  };
}
