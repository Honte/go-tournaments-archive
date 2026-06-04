import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { getClosedViewerSearch, getOpenViewerSearch } from './utils';

describe('SGF viewer search helpers', () => {
  it('sets the raw SGF search param and preserves unrelated params', () => {
    const searchParams = new URLSearchParams('foo=bar');

    assert.equal(getOpenViewerSearch(searchParams, '/sgf/2025/game.sgf'), '?foo=bar&sgf=%2Fsgf%2F2025%2Fgame.sgf');
  });

  it('replaces only the SGF search param when opening another game', () => {
    const searchParams = new URLSearchParams('foo=bar&sgf=%2Fsgf%2F2024%2Fold.sgf');

    assert.equal(getOpenViewerSearch(searchParams, '2025/game.sgf'), '?foo=bar&sgf=2025%2Fgame.sgf');
  });

  it('does not validate or canonicalize SGF values', () => {
    const searchParams = new URLSearchParams();

    assert.equal(getOpenViewerSearch(searchParams, 'whatever'), '?sgf=whatever');
  });

  it('removes only the SGF search param when closing', () => {
    const searchParams = new URLSearchParams('foo=bar&sgf=%2Fsgf%2F2025%2Fgame.sgf&baz=qux');

    assert.equal(getClosedViewerSearch(searchParams), '?foo=bar&baz=qux');
  });

  it('returns an empty relative search when closing with no remaining params', () => {
    const searchParams = new URLSearchParams('sgf=%2Fsgf%2F2025%2Fgame.sgf');

    assert.equal(getClosedViewerSearch(searchParams), '?');
  });
});
