import { DEFAULT_GAME_BROWSER_STATE, type GameRecordsState } from '@/libs/gameRecords/schema';

export function getActiveGameFilterCount(state: GameRecordsState) {
  return [
    state.player,
    state.country,
    state.opponent,
    state.opponentCountry,
    state.category,
    state.playerColor,
    state.playerRankMin || state.playerRankMax,
    state.opponentRankMin || state.opponentRankMax,
    state.years.length > 0,
    state.movesMin !== undefined || state.movesMax !== undefined,
    state.results.length > 0,
    state.komi.length > 0,
    state.winner,
    state.media.length > 0,
    state.sort !== DEFAULT_GAME_BROWSER_STATE.sort,
    state.group !== DEFAULT_GAME_BROWSER_STATE.group,
  ].filter(Boolean).length;
}
