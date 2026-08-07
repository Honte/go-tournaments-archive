import type { ApiGameInfo } from '@/schema/api';
import { isDrawResult } from '@/libs/games';
import { buildGameRecordsFacets, getGameRecordsDomains } from './facets';
import { filterGameRecords } from './filters';
import { getPlayerMeta, groupGameRecords } from './grouping';
import type { GameRecordsModel, GameRecordsOptions, GameRecordsState } from './schema';
import { sortGameRecords } from './sorting';
import { getCategories, getGameGroupEligibility, groupingForState, normalizeGameRecordsState } from './state';

export function buildGameRecordsModel(
  games: readonly ApiGameInfo[],
  requestedState: GameRecordsState,
  options: GameRecordsOptions = {}
): GameRecordsModel {
  const countriesEnabled = options.countriesEnabled ?? true;
  const categoriesEnabled = options.categoriesEnabled ?? true;
  const countryLabel = options.countryLabel ?? ((country: string) => country);
  const categoryLabel = options.categoryLabel ?? ((category: string) => category);
  const hasCategories = categoriesEnabled && Boolean(getCategories(games).size);
  const state = normalizeGameRecordsState(games, requestedState, { countriesEnabled, categoriesEnabled });
  const grouping = getGameGroupEligibility(state, countriesEnabled, hasCategories);
  const normalizedState = groupingForState(state, grouping);
  const matches = sortGameRecords(filterGameRecords(games, normalizedState), normalizedState.sort);

  return {
    state: normalizedState,
    totalCount: games.length,
    filteredCount: matches.length,
    hasJigo: games.some((game) => isDrawResult(game.result)),
    games: matches.map((match) => match.game),
    groups: groupGameRecords(matches, normalizedState, {
      playerMeta: getPlayerMeta(games),
      countryLabel,
      categoryLabel,
      unknownCountryLabel: options.unknownCountryLabel ?? '?',
    }),
    facets: buildGameRecordsFacets(games, normalizedState, {
      countriesEnabled,
      categoriesEnabled,
      countryLabel,
      categoryLabel,
      unknownKomiLabel: options.unknownKomiLabel ?? 'Unknown',
    }),
    domains: getGameRecordsDomains(games),
    grouping,
  };
}
