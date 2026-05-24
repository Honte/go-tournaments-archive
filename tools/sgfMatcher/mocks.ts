import type { H9Player } from '@/libs/h9';
import type { SgfInfo } from './types';

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

export function makeSgfInfo(overrides: Partial<SgfInfo> = {}): SgfInfo {
  return {
    path: '2025/1-BlackPlayer-WhitePlayer.sgf',
    sgfBlackName: 'Black Player',
    sgfWhiteName: 'White Player',
    sgfRound: null,
    filenameBlackName: 'BlackPlayer',
    filenameWhiteName: 'WhitePlayer',
    filenameRound: 1,
    filenameStage: null,
    rawResult: 'B+R',
    cleanResult: 'B+R',
    resultIssue: null,
    contentIssue: null,
    corrupted: false,
    ...overrides,
  };
}
