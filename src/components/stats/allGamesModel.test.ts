import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { ApiGameInfo } from '@/schema/api';
import type { Player } from '@/schema/data';
import {
  DEFAULT_GAME_BROWSER_STATE,
  deriveGameBrowserModel,
  filterGameRecords,
  getGameGroupEligibility,
  getGameResultType,
  getRankLevel,
  normalizeGameBrowserState,
  parseGameBrowserState,
  serializeGameBrowserState,
  type GameBrowserState,
} from '@/components/stats/allGamesModel';

describe('game browser URL state', () => {
  it('round-trips canonical state and preserves unrelated query parameters', () => {
    const parsed = parseGameBrowserState(
      new URLSearchParams(
        'player=a&country=de&opponent=b&opponentCountry=pl&playerRankMin=5K&year=2023&year=2020&movesMax=200' +
          '&category=u18&result=time&result=resignation&winner=opponent&has=yt&has=ogs&sort=moves-desc&group=year'
      )
    );
    const serialized = serializeGameBrowserState(
      parsed,
      new URLSearchParams('locale=pl&source=archive&player=stale&result=other')
    );

    assert.equal(serialized.get('locale'), 'pl');
    assert.equal(serialized.get('source'), 'archive');
    assert.equal(serialized.get('player'), 'a');
    assert.deepEqual(serialized.getAll('year'), ['2023', '2020']);
    assert.deepEqual(serialized.getAll('result'), ['resignation', 'time']);
    assert.deepEqual(serialized.getAll('has'), ['ogs', 'yt']);
    assert.equal(serialized.get('winner'), 'opponent');
    assert.equal(serialized.get('category'), 'u18');
    assert.equal(serialized.get('group'), 'year');
    assert.deepEqual(parseGameBrowserState(serialized), parsed);
  });

  it('parses global-color and focal-role winner values', () => {
    for (const winner of ['black', 'white', 'player', 'opponent'] as const) {
      assert.equal(parseGameBrowserState(new URLSearchParams(`winner=${winner}`)).winner, winner);
    }
  });

  it('falls back to defaults for unknown enum values', () => {
    const parsed = parseGameBrowserState(
      new URLSearchParams('result=unknown&has=video&winner=draw&sort=random&group=player')
    );

    assert.deepEqual(parsed.results, []);
    assert.deepEqual(parsed.media, []);
    assert.equal(parsed.sort, DEFAULT_GAME_BROWSER_STATE.sort);
    assert.equal(parsed.group, DEFAULT_GAME_BROWSER_STATE.group);
    assert.equal(parsed.winner, undefined);
  });

  it('ignores and removes legacy tournament-year ranges', () => {
    const legacy = new URLSearchParams('yearMin=2020&yearMax=2022');
    const parsed = parseGameBrowserState(legacy);
    const serialized = serializeGameBrowserState(parsed, legacy);

    assert.deepEqual(parsed.years, []);
    assert.equal('yearMin' in parsed, false);
    assert.equal('yearMax' in parsed, false);
    assert.equal(serialized.has('yearMin'), false);
    assert.equal(serialized.has('yearMax'), false);
  });
});

describe('game result and rank normalization', () => {
  it('classifies only the supported result forms', () => {
    assert.equal(getGameResultType('B+R'), 'resignation');
    assert.equal(getGameResultType(' w+t '), 'time');
    assert.equal(getGameResultType('B+2,5PTS'), 'points');
    assert.equal(getGameResultType('W+0.5'), 'points');
    assert.equal(getGameResultType('Void'), 'other');
    assert.equal(getGameResultType('B+Resign'), 'other');
  });

  it('uses a contiguous kyu, dan, and professional rank ladder', () => {
    assert.equal(getRankLevel('1d')! - getRankLevel('1k')!, 1);
    assert.equal(getRankLevel('1p')! - getRankLevel('9d')!, 1);
    assert.equal(getRankLevel('3D'), getRankLevel('3d'));
    assert.equal(getRankLevel('unranked'), undefined);
  });
});

describe('game filtering and facets', () => {
  const games = createGames();

  it('treats player and opponent as focal roles independent of stone color', () => {
    const versusBob = filterGameRecords(games, state({ player: 'a', opponent: 'b' }));
    const versusCarolFromGermany = filterGameRecords(
      games,
      state({ player: 'a', country: 'DE', opponent: 'c', opponentCountry: 'FR' })
    );

    assert.deepEqual(
      versusBob.map((match) => match.game.sgf),
      ['g1.sgf', 'g4.sgf']
    );
    assert.deepEqual(
      versusCarolFromGermany.map((match) => match.game.sgf),
      ['g2.sgf']
    );
  });

  it('combines result, media, winner, year, moves, and oriented rank ranges', () => {
    const matches = filterGameRecords(
      games,
      state({
        player: 'a',
        playerRankMin: '3d',
        opponentRankMax: '3d',
        years: [2023],
        movesMin: 100,
        movesMax: 100,
        results: ['points'],
        winner: 'white',
        media: ['ogs', 'yt'],
      })
    );

    assert.deepEqual(
      matches.map((match) => match.game.sgf),
      ['g4.sgf']
    );
  });

  it('distinguishes global winner colors from focal player and opponent wins', () => {
    const blackWins = deriveGameBrowserModel(games, state({ winner: 'black' }));
    const whiteWins = deriveGameBrowserModel(games, state({ winner: 'white' }));
    const aliceWins = deriveGameBrowserModel(games, state({ player: 'a', winner: 'player' }));
    const opponentsBeatBob = deriveGameBrowserModel(games, state({ player: 'b', winner: 'opponent' }));
    const invalidFocalWinner = deriveGameBrowserModel(games, state({ winner: 'player' }));

    assert.deepEqual(
      blackWins.games.map((game) => game.sgf),
      ['g3.sgf', 'g1.sgf']
    );
    assert.deepEqual(
      whiteWins.games.map((game) => game.sgf),
      ['g4.sgf', 'g2.sgf']
    );
    assert.deepEqual(
      aliceWins.games.map((game) => game.sgf),
      ['g4.sgf', 'g2.sgf', 'g1.sgf']
    );
    assert.deepEqual(
      opponentsBeatBob.games.map((game) => game.sgf),
      ['g4.sgf', 'g1.sgf']
    );
    assert.equal(invalidFocalWinner.state.winner, undefined);
    assert.equal(invalidFocalWinner.filteredCount, games.length);
  });

  it('matches non-contiguous tournament-year selections exactly', () => {
    const model = deriveGameBrowserModel(games, state({ years: [2020, 2023] }));

    assert.deepEqual(
      model.games.map((game) => game.sgf),
      ['g4.sgf', 'g1.sgf']
    );
    assert.deepEqual(model.domains.years, [2023, 2022, 2021, 2020]);
    assert.equal('yearMin' in model.domains, false);
    assert.equal('yearMax' in model.domains, false);
  });

  it('builds reciprocal multi-country opponent facets with would-match counts', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a' }));

    assert.deepEqual(toCounts(model.facets.country.options), { DE: 1, PL: 2 });
    assert.deepEqual(toCounts(model.facets.opponent.options), { b: 2, c: 1 });
    assert.deepEqual(toCounts(model.facets.opponentCountry.options), { DE: 2, FR: 1 });

    const alice = model.facets.player.options.find((option) => option.value === 'a');
    assert.equal(alice?.label, 'Alice New');
    assert.equal(alice?.count, 3);
    assert.match(alice?.search ?? '', /Alice Old/);
  });

  it('sorts player facets by live count, then label, while countries remain alphabetical', () => {
    const facetGames = [
      game('order-1', 2020, player('a', 'Alice', '1d', 'PL'), player('b', 'Bob', '1d', 'DE'), {
        result: 'B+R',
        winner: 'black',
        moves: 100,
      }),
      game('order-2', 2021, player('z', 'Zoe', '1d', 'FR'), player('b', 'Bob', '1d', 'DE'), {
        result: 'W+R',
        winner: 'white',
        moves: 100,
      }),
      game('order-3', 2022, player('z', 'Zoe', '1d', 'FR'), player('c', 'Carol', '1d', 'PL'), {
        result: 'B+R',
        winner: 'black',
        moves: 100,
      }),
    ];
    const model = deriveGameBrowserModel(facetGames, state());

    assert.deepEqual(
      model.facets.player.options.map((option) => [option.value, option.count]),
      [
        ['b', 2],
        ['z', 2],
        ['a', 1],
        ['c', 1],
      ]
    );
    assert.deepEqual(
      model.facets.country.options.map((option) => option.value),
      ['DE', 'FR', 'PL']
    );
  });

  it('uses self-excluding counts and counts a same-country game only once', () => {
    const playerModel = deriveGameBrowserModel(games, state({ player: 'a', country: 'PL' }));
    const countryModel = deriveGameBrowserModel(games, state({ country: 'PL' }));

    assert.deepEqual(toCounts(playerModel.facets.country.options), { DE: 1, PL: 2 });
    assert.deepEqual(toCounts(countryModel.facets.opponentCountry.options), { DE: 2, PL: 1 });
    assert.equal(countryModel.filteredCount, 3);
  });

  it('retains a structurally valid selected option with a zero live count', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', opponent: 'b', results: ['time'] }));
    const selectedOpponent = model.facets.opponent.options.find((option) => option.value === 'b');

    assert.equal(model.state.opponent, 'b');
    assert.equal(model.filteredCount, 0);
    assert.equal(selectedOpponent?.count, 0);
    assert.equal(toCounts(model.facets.opponent.options).c, 1);
  });

  it('updates year and media counts from the current filter state', () => {
    const playerModel = deriveGameBrowserModel(games, state({ player: 'a', years: [2023] }));
    const mediaOptions = deriveGameBrowserModel(games, state({ player: 'a' }));
    const selectedMedia = deriveGameBrowserModel(games, state({ player: 'a', media: ['ogs'] }));

    assert.deepEqual(toCounts(playerModel.facets.year.options), { 2020: 1, 2021: 1, 2023: 1 });
    assert.deepEqual(mediaOptions.facets.media, { ogs: 2, yt: 2, ai: 0 });
    assert.deepEqual(selectedMedia.facets.media, { ogs: 2, yt: 1, ai: 0 });
  });

  it('builds self-excluding winner counts for colors and focal roles', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', winner: 'black' }));

    assert.deepEqual(model.facets.winner, { black: 1, white: 2, player: 3, opponent: 0 });
  });

  it('retains a selected year with zero matches from unrelated filters', () => {
    const model = deriveGameBrowserModel(games, state({ player: 'a', years: [2020], results: ['time'] }));

    assert.equal(model.filteredCount, 0);
    assert.deepEqual(toCounts(model.facets.year.options), { 2020: 0, 2021: 1 });
  });

  it('filters and facets categories only when category data is enabled', () => {
    const categorized = createGames().map((record, index) => ({
      ...record,
      category: index < 2 ? 'junior' : 'open',
    }));
    const model = deriveGameBrowserModel(categorized, state({ player: 'a', category: 'junior' }), {
      categoriesEnabled: true,
      categoryLabel: (category) => category.toUpperCase(),
    });

    assert.deepEqual(toCounts(model.facets.category.options), { junior: 2, open: 1 });
    assert.deepEqual(
      model.games.map((record) => record.sgf),
      ['g2.sgf', 'g1.sgf']
    );
    assert.equal(model.facets.category.options[0]?.label, 'JUNIOR');
  });
});

describe('dependent normalization, sorting, and grouping', () => {
  const games = createGames();

  it('clears structurally invalid dependents but keeps a valid country-anchored opponent country', () => {
    const invalid = normalizeGameBrowserState(
      games,
      state({ player: 'a', country: 'FR', opponent: 'e', opponentCountry: 'PL' })
    );
    const countryAnchored = normalizeGameBrowserState(
      games,
      state({ country: 'PL', opponent: 'b', opponentCountry: 'DE' })
    );

    assert.equal(invalid.player, 'a');
    assert.equal(invalid.country, undefined);
    assert.equal(invalid.opponent, undefined);
    assert.equal(invalid.opponentCountry, undefined);
    assert.equal(countryAnchored.opponent, undefined);
    assert.equal(countryAnchored.opponentCountry, 'DE');
  });

  it('sorts stably by moves and by contiguous rank gap', () => {
    const byMoves = deriveGameBrowserModel(games, state({ sort: 'moves-desc' }));
    const byGap = deriveGameBrowserModel(games, state({ sort: 'rank-gap-asc' }));

    assert.deepEqual(
      byMoves.games.map((game) => game.sgf),
      ['g3.sgf', 'g2.sgf', 'g4.sgf', 'g1.sgf']
    );
    assert.deepEqual(
      byGap.games.map((game) => game.sgf),
      ['g4.sgf', 'g3.sgf', 'g1.sgf', 'g2.sgf']
    );
  });

  it('exposes only eligible grouping and groups sorted cards without duplication', () => {
    assert.deepEqual(getGameGroupEligibility(state({ player: 'a' })), {
      opponentPlayer: true,
      opponentCountry: true,
      countryPlayer: false,
      category: false,
    });
    assert.deepEqual(getGameGroupEligibility(state({ player: 'a', opponent: 'b' })), {
      opponentPlayer: false,
      opponentCountry: false,
      countryPlayer: false,
      category: false,
    });
    assert.deepEqual(getGameGroupEligibility(state({ country: 'PL' })), {
      opponentPlayer: true,
      opponentCountry: true,
      countryPlayer: true,
      category: false,
    });

    const byOpponent = deriveGameBrowserModel(games, state({ player: 'a', group: 'opponent-player' }));
    const byCountry = deriveGameBrowserModel(games, state({ country: 'PL', group: 'opponent-country' }));
    const byCountryPlayer = deriveGameBrowserModel(games, state({ country: 'PL', group: 'country-player' }));
    const byYear = deriveGameBrowserModel(games, state({ group: 'year' }));
    const invalidGroup = deriveGameBrowserModel(games, state({ player: 'a', opponent: 'b', group: 'opponent-player' }));

    assert.deepEqual(
      byOpponent.groups.map((group) => [group.label, group.games.length]),
      [
        ['Bob', 2],
        ['Carol', 1],
      ]
    );
    assert.deepEqual(
      byCountry.groups.map((group) => [group.key, group.games.length]),
      [
        ['DE', 2],
        ['PL', 1],
      ]
    );
    assert.equal(byCountry.groups.flatMap((group) => group.games).length, byCountry.filteredCount);
    assert.deepEqual(
      byCountryPlayer.groups.map((group) => [group.label, group.games.length]),
      [
        ['Alice New', 2],
        ['Dan vs Eve', 1],
      ]
    );
    assert.deepEqual(
      byYear.groups.map((group) => group.label),
      ['2023', '2022', '2021', '2020']
    );
    assert.equal(invalidGroup.state.group, 'none');
  });

  it('groups category records when categories are available', () => {
    const categorized = createGames().map((record, index) => ({
      ...record,
      category: index % 2 === 0 ? 'junior' : 'open',
    }));
    const model = deriveGameBrowserModel(categorized, state({ group: 'category' }), {
      categoriesEnabled: true,
      categoryLabel: (category) => category.toUpperCase(),
    });

    assert.equal(getGameGroupEligibility(state(), true, true).category, true);
    assert.deepEqual(
      model.groups.map((group) => [group.label, group.games.length]),
      [
        ['JUNIOR', 2],
        ['OPEN', 2],
      ]
    );
  });
});

function state(overrides: Partial<GameBrowserState> = {}): GameBrowserState {
  return {
    ...DEFAULT_GAME_BROWSER_STATE,
    results: [],
    media: [],
    ...overrides,
  };
}

function toCounts(options: { value: string; count: number }[]) {
  return Object.fromEntries(options.map((option) => [option.value, option.count])) as Record<string, number>;
}

function createGames(): ApiGameInfo[] {
  return [
    game('g1', 2020, player('a', 'Alice Old', '1d', 'PL'), player('b', 'Bob', '3d', 'DE'), {
      result: 'B+R',
      winner: 'black',
      moves: 100,
      ogs: '1',
    }),
    game('g2', 2021, player('c', 'Carol', '5d', 'FR'), player('a', 'Alice New', '2d', 'DE'), {
      result: 'W+T',
      winner: 'white',
      moves: 150,
      yt: 'video-2',
    }),
    game('g3', 2022, player('d', 'Dan', '5k', 'PL'), player('e', 'Eve', '4k', 'PL'), {
      result: 'B+2.5',
      winner: 'black',
      moves: 200,
      ai: 'analysis-3',
    }),
    game('g4', 2023, player('b', 'Bob', '3d', 'DE'), player('a', 'Alice New', '3d', 'PL'), {
      result: 'W+0.5',
      winner: 'white',
      moves: 100,
      ogs: '4',
      yt: ['video-4'],
    }),
  ];
}

function player(id: string, name: string, rank: string, country: string): Player {
  return { id, name, rank, country };
}

function game(
  id: string,
  tournament: number,
  black: Player,
  white: Player,
  details: Pick<ApiGameInfo, 'result' | 'winner' | 'moves'> & Pick<ApiGameInfo, 'ogs' | 'yt' | 'ai'>
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
