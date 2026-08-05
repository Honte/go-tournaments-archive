import type { ApiGameInfo } from '@/schema/api';
import type { Player } from '@/schema/data';
import { DEFAULT_GAME_BROWSER_STATE, type GameBrowserState } from '@/libs/gameRecords';

export function state(overrides: Partial<GameBrowserState> = {}): GameBrowserState {
  return {
    ...DEFAULT_GAME_BROWSER_STATE,
    results: [],
    media: [],
    ...overrides,
  };
}

export function toCounts(options: { value: string; count: number }[]) {
  return Object.fromEntries(options.map((option) => [option.value, option.count])) as Record<string, number>;
}

export function createGames(): ApiGameInfo[] {
  return [
    game('g1', 2020, player('a', 'Alice Old', '1d', 'PL'), player('b', 'Bob', '3d', 'DE'), {
      result: 'B+R',
      winner: 'black',
      moves: 100,
      komi: 6.5,
      ogs: '1',
    }),
    game('g2', 2021, player('c', 'Carol', '5d', 'FR'), player('a', 'Alice New', '2d', 'DE'), {
      result: 'W+T',
      winner: 'white',
      moves: 150,
      komi: 7.5,
      yt: 'video-2',
    }),
    game('g3', 2022, player('d', 'Dan', '5k', 'PL'), player('e', 'Eve', '4k', 'PL'), {
      result: 'B+2.5',
      winner: 'black',
      moves: 200,
      komi: 7.5,
      ai: 'analysis-3',
    }),
    game('g4', 2023, player('b', 'Bob', '3d', 'DE'), player('a', 'Alice New', '3d', 'PL'), {
      result: 'W+0.5',
      winner: 'white',
      moves: 100,
      komi: 0.5,
      ogs: '4',
      yt: ['video-4'],
    }),
  ];
}

export function player(id: string, name: string, rank: string, country: string): Player {
  return { id, name, rank, country };
}

export function game(
  id: string,
  tournament: number,
  black: Player,
  white: Player,
  details: Pick<ApiGameInfo, 'result' | 'winner' | 'moves'> & Partial<Pick<ApiGameInfo, 'ogs' | 'yt' | 'ai' | 'komi'>>
): ApiGameInfo {
  return {
    sgf: `${id}.sgf`,
    tournament,
    stage: 0,
    black,
    white,
    ...details,
  };
}
