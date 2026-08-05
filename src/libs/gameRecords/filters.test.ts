import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { filterGameRecords, getGameResultType } from './filters';
import { deriveGameBrowserModel } from './model';
import { createGames, game, player, state } from './testFixtures';

describe('game result and rank normalization', () => {
  it('classifies only the supported result forms', () => {
    assert.equal(getGameResultType('B+R'), 'resignation');
    assert.equal(getGameResultType(' w+t '), 'time');
    assert.equal(getGameResultType('B+2,5PTS'), 'points');
    assert.equal(getGameResultType('W+0.5'), 'points');
    assert.equal(getGameResultType('Void'), 'other');
    assert.equal(getGameResultType('B+Resign'), 'other');
    assert.equal(getGameResultType('W+F'), 'other');
    assert.equal(getGameResultType('B+?'), 'unknown');
    assert.equal(getGameResultType(), 'other');
  });
});

describe('game filtering', () => {
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

  it('distinguishes global, player-relative, and country-relative winner values', () => {
    const blackWins = deriveGameBrowserModel(games, state({ winner: 'black' }));
    const whiteWins = deriveGameBrowserModel(games, state({ winner: 'white' }));
    const aliceWins = deriveGameBrowserModel(games, state({ player: 'a', winner: 'player' }));
    const opponentsBeatBob = deriveGameBrowserModel(games, state({ player: 'b', winner: 'player-opponent' }));
    const polishPlayersWin = deriveGameBrowserModel(games, state({ country: 'PL', winner: 'country' }));
    const polishOpponentsWin = deriveGameBrowserModel(games, state({ country: 'PL', winner: 'country-opponent' }));
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
    assert.deepEqual(
      polishPlayersWin.games.map((game) => game.sgf),
      ['g4.sgf', 'g3.sgf', 'g1.sgf']
    );
    assert.deepEqual(
      polishOpponentsWin.games.map((game) => game.sgf),
      ['g3.sgf']
    );
    assert.equal(invalidFocalWinner.state.winner, undefined);
    assert.equal(invalidFocalWinner.filteredCount, games.length);
  });

  it('filters Jigo games, includes them in winner facets, and reports their availability from all games', () => {
    const drawGame = game('g5', 2024, player('a', 'Alice New', '3d', 'PL'), player('f', 'Fran', '2d', 'DE'), {
      result: 'jigo',
      moves: 180,
    });
    const model = deriveGameBrowserModel([...games, drawGame], state({ winner: 'jigo' }));

    assert.deepEqual(
      model.games.map((game) => game.sgf),
      ['g5.sgf']
    );
    assert.equal(model.facets.winner.jigo, 1);
    assert.equal(model.hasJigo, true);
    assert.equal(deriveGameBrowserModel(games, state()).hasJigo, false);
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
});
