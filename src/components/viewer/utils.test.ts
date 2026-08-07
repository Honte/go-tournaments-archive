import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getGameViewerSearch } from './utils';

describe('SGF viewer search helpers', () => {
  it('sets the SGF search param and preserves unrelated params', () => {
    const search = getGameViewerSearch(new URLSearchParams('foo=bar'), '/sgf/2008/game.sgf');

    assert.equal(search.toString(), 'foo=bar&sgf=%2Fsgf%2F2008%2Fgame.sgf');
  });

  it('replaces only the SGF search param when opening another game', () => {
    const search = getGameViewerSearch(new URLSearchParams('foo=bar&sgf=%2Fsgf%2F2007%2Fold.sgf'), '2008/game.sgf');

    assert.equal(search.toString(), 'foo=bar&sgf=2008%2Fgame.sgf');
  });

  it('removes only the SGF search param when closing', () => {
    const search = getGameViewerSearch(new URLSearchParams('foo=bar&sgf=%2Fsgf%2F2008%2Fgame.sgf&baz=qux'), null);

    assert.equal(search.toString(), 'foo=bar&baz=qux');
  });
});
