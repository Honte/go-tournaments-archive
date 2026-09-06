import type { ApiGameInfo } from '@/schema/api';
import type { OrientedGame } from './filters';
import type { GameGroup, GameRecordsGroupResult, GameRecordsState } from './schema';

type PlayerMeta = { label: string; aliases: Set<string>; latestTournament: number };
type GroupOptions = {
  playerMeta: Map<string, PlayerMeta>;
  countryLabel: (country: string) => string;
  categoryLabel: (category: string) => string;
  unknownCountryLabel: string;
  roundLabel: string;
  restLabel: string;
  stageLabel: (game: ApiGameInfo) => string;
  games: readonly ApiGameInfo[];
};

export function groupGameRecords(
  matches: readonly OrientedGame[],
  state: GameRecordsState,
  options: GroupOptions
): GameRecordsGroupResult[] {
  if (state.group === 'none') {
    return [
      {
        key: 'all',
        games: matches.map((match) => match.game),
      },
    ];
  }

  const stagesByYear = new Map<number, Set<number>>();
  if (state.group === 'year-round') {
    for (const game of options.games) {
      const stages = stagesByYear.get(game.tournament) ?? new Set<number>();
      stages.add(game.stage);
      stagesByYear.set(game.tournament, stages);
    }
  }

  const groups = new Map<string, { label: string; games: ApiGameInfo[] }>();

  for (const match of matches) {
    const details = getGroupDetails(
      match,
      state.group,
      state,
      options,
      (stagesByYear.get(match.game.tournament)?.size ?? 0) > 1
    );
    const current = groups.get(details.key) ?? { label: details.label, games: [] };
    current.games.push(match.game);
    groups.set(details.key, current);
  }

  return [...groups]
    .toSorted(([leftKey, left], [rightKey, right]) => {
      const yearDirection = state.sort === 'year-asc' ? 1 : -1;
      const defaultOrder =
        state.group === 'year'
          ? (Number(leftKey) - Number(rightKey)) * yearDirection
          : state.group === 'year-round'
            ? (left.games[0].tournament - right.games[0].tournament) * yearDirection ||
              left.games[0].stage - right.games[0].stage ||
              (left.games[0].round ?? Infinity) - (right.games[0].round ?? Infinity)
            : left.label.localeCompare(right.label);

      if (state.sort === 'group-count-desc') {
        return right.games.length - left.games.length || defaultOrder;
      }

      if (state.sort === 'group-count-asc') {
        return left.games.length - right.games.length || defaultOrder;
      }

      return defaultOrder;
    })
    .map(([key, group]) => ({
      key,
      label: group.label,
      games: group.games,
    }));
}

export function getPlayerMeta(games: readonly ApiGameInfo[]) {
  const result = new Map<string, PlayerMeta>();

  for (const game of games) {
    for (const player of [game.black, game.white]) {
      const current = result.get(player.id);
      const aliases = current?.aliases ?? new Set<string>();

      aliases.add(player.name);

      if (player.original) {
        aliases.add(player.original);
      }

      for (const nickname of player.nickname ?? []) {
        aliases.add(nickname);
      }

      if (!current || game.tournament >= current.latestTournament) {
        result.set(player.id, { label: player.name, aliases, latestTournament: game.tournament });
      } else {
        current.aliases = aliases;
      }
    }
  }

  return result;
}

function getGroupDetails(
  match: OrientedGame,
  group: Exclude<GameGroup, 'none'>,
  state: GameRecordsState,
  options: GroupOptions,
  showStage: boolean
) {
  const UNKNOWN = '__unknown__';

  switch (group) {
    case 'opponent-player':
      return {
        key: match.opponent.id,
        label: options.playerMeta.get(match.opponent.id)?.label ?? match.opponent.name,
      };
    case 'opponent-country': {
      const country = match.opponent.country?.toUpperCase() ?? UNKNOWN;

      return {
        key: country,
        label: country === UNKNOWN ? options.unknownCountryLabel : options.countryLabel(country),
      };
    }
    case 'country-player': {
      const selectedCountry = state.country?.toUpperCase();
      const sameCountry =
        selectedCountry &&
        match.player.country?.toUpperCase() === selectedCountry &&
        match.opponent.country?.toUpperCase() === selectedCountry;

      if (sameCountry) {
        const players = [match.player, match.opponent]
          .map((player) => ({ id: player.id, label: options.playerMeta.get(player.id)?.label ?? player.name }))
          .toSorted((left, right) => left.label.localeCompare(right.label) || left.id.localeCompare(right.id));

        return {
          key: `pair:${players.map((player) => player.id).join('|')}`,
          label: `${players[0].label}, ${players[1].label}`,
        };
      }

      return {
        key: `player:${match.player.id}`,
        label: options.playerMeta.get(match.player.id)?.label ?? match.player.name,
      };
    }
    case 'year-round': {
      const game = match.game;
      const parts = [String(game.tournament)];

      if (showStage) {
        parts.push(options.stageLabel(game));
      }

      if (game.round !== undefined) {
        parts.push(`${options.roundLabel} ${game.round}`);
      }

      if (parts.length === 1) {
        parts.push(options.restLabel);
      }

      return {
        key: `${game.tournament}:${game.stage}:${game.round ?? '?'}`,
        label: parts.join(' - '),
      };
    }
    case 'year':
      return {
        key: String(match.game.tournament),
        label: String(match.game.tournament),
      };
    case 'category': {
      const category = match.game.category ?? UNKNOWN;

      return {
        key: category,
        label: category === UNKNOWN ? options.unknownCountryLabel : options.categoryLabel(category),
      };
    }
  }
}
