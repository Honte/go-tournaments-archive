import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MultipleGameBranchEndsError, MultipleLongestBranchesError } from './errors';
import { Sgf } from './index';

describe('Sgf', () => {
  it('parses SGF documentation sequence and variation examples', () => {
    const sgf = new Sgf('(;FF[4]GM[1]SZ[19];B[aa];W[bb](;B[cc];W[dd];B[ad];W[bd])(;B[hh];W[hg]))');
    const root = sgf.getRoot();

    assert.equal(root.id, 0);
    assert.equal(root.parentId, undefined);
    assert.deepEqual(root.data, { FF: ['4'], GM: ['1'], SZ: ['19'] });
    assert.equal(root.children[0].data.B[0], 'aa');
    assert.equal(root.children[0].parentId, root.id);
    assert.equal(root.children[0].children[0].data.W[0], 'bb');
    assert.equal(root.children[0].children[0].parentId, root.children[0].id);
    assert.equal(root.children[0].children[0].children.length, 2);
    assert.equal(root.children[0].children[0].children[0].parentId, root.children[0].children[0].id);
    assert.equal(root.children[0].children[0].children[1].parentId, root.children[0].children[0].id);
  });

  it('enforces a single root game tree', () => {
    assert.throws(() => new Sgf(''), /Expected SGF game tree/);
    assert.throws(() => new Sgf('(;B[aa]'), /Expected "\)"/);
  });

  it('parses top-level game trees without outer parentheses', () => {
    const sgf = new Sgf(';CA[UTF-8]FF[4]GM[1]SZ[19];B[pd];W[dd](;B[qp])(;B[qq])');

    assert.deepEqual(sgf.getRoot().data, { CA: ['UTF-8'], FF: ['4'], GM: ['1'], SZ: ['19'] });
    assert.equal(sgf.getNode(1)?.data.B[0], 'pd');
    assert.equal(sgf.getNode(2)?.children.length, 2);
    assert.equal(sgf.getNode(1)?.parentId, 0);
    assert.equal(sgf.getNode(2)?.parentId, 1);
    assert.equal(sgf.getNode(3)?.parentId, 2);
    assert.equal(sgf.getNode(4)?.parentId, 2);
  });

  it('skips empty variations in malformed SGF content', () => {
    const sgf = new Sgf('(;B[aa]()(;W[bb])())');

    assert.equal(sgf.getRoot().children.length, 1);
    assert.deepEqual(sgf.getRoot().data, {});
    assert.deepEqual(sgf.getRoot().children[0].data, { B: ['aa'] });
    assert.deepEqual(sgf.getRoot().children[0].children[0].data, { W: ['bb'] });
  });

  it('accepts SGF collections by preserving the first game tree', () => {
    const sgf = new Sgf('(;GN[first];B[aa])(;GN[second];B[bb])');

    assert.deepEqual(sgf.getRoot().data, { GN: ['first'] });
  });

  it('exposes root and node lookups', () => {
    const sgf = new Sgf('(;A[root];B[aa];W[bb])');

    assert.equal(sgf.getRoot().id, 0);
    assert.equal(sgf.getRoot().parentId, undefined);
    assert.deepEqual(sgf.getNode(1)?.data, { B: ['aa'] });
    assert.equal(sgf.getNode(1)?.parentId, 0);
    assert.deepEqual(sgf.getNode(2)?.data, { W: ['bb'] });
    assert.equal(sgf.getNode(2)?.parentId, 1);
    assert.equal(sgf.getNode(999), undefined);
  });

  it('preserves escaped values, multi-value properties, and normalized identifiers', () => {
    const sgf = new Sgf(String.raw`(;C[hello\] bracket \\ slash]CoPyright[a]b[cc]XX[one][two])`);
    const root = sgf.getRoot();

    assert.deepEqual(root.data.C, ['hello] bracket \\ slash']);
    assert.deepEqual(root.data.COPYRIGHT, ['a']);
    assert.deepEqual(root.data.XX, ['one', 'two']);
    assert.deepEqual(root.children[0].data.B, ['cc']);
  });

  it('moves root move properties and move annotations to a child node', () => {
    const sgf = new Sgf('(;FF[4]SZ[19]B[aa]MN[1]KO[]BM[2]DO[]IT[]TE[2];W[bb])');
    const root = sgf.getRoot();
    const rootMove = root.children[0];
    const secondMove = rootMove.children[0];

    assert.deepEqual(root.data, { FF: ['4'], SZ: ['19'] });
    assert.deepEqual(rootMove.data, {
      B: ['aa'],
      MN: ['1'],
      KO: [''],
      BM: ['2'],
      DO: [''],
      IT: [''],
      TE: ['2'],
    });
    assert.equal(rootMove.parentId, root.id);
    assert.deepEqual(secondMove.data, { W: ['bb'] });
    assert.equal(secondMove.parentId, rootMove.id);
  });

  it('keeps root annotations on root when there is no root move', () => {
    const sgf = new Sgf('(;MN[1]TE[2];B[aa])');
    const root = sgf.getRoot();

    assert.deepEqual(root.data, { MN: ['1'], TE: ['2'] });
    assert.deepEqual(root.children[0].data, { B: ['aa'] });
    assert.equal(root.children[0].parentId, root.id);
  });

  it('keeps setup properties on root and does not treat them as moves', () => {
    const sgf = new Sgf('(;AB[aa][bb]AW[cc]MN[1];B[dd])');
    const root = sgf.getRoot();

    assert.deepEqual(root.data, { AB: ['aa', 'bb'], AW: ['cc'], MN: ['1'] });
    assert.deepEqual(root.children[0].data, { B: ['dd'] });
    assert.equal(root.children[0].parentId, root.id);
  });

  it('preserves variations under a root move after splitting it into a child node', () => {
    const sgf = new Sgf('(;B[aa]TE[1](;W[bb])(;W[cc]))');
    const root = sgf.getRoot();
    const rootMove = root.children[0];

    assert.deepEqual(root.data, {});
    assert.deepEqual(rootMove.data, { B: ['aa'], TE: ['1'] });
    assert.equal(rootMove.parentId, root.id);
    assert.deepEqual(
      rootMove.children.map((child) => child.data),
      [{ W: ['bb'] }, { W: ['cc'] }]
    );
    assert.equal(rootMove.children[0].parentId, rootMove.id);
    assert.equal(rootMove.children[1].parentId, rootMove.id);
  });

  it('removes escaped line breaks inside values', () => {
    const content = ['(;C[line\\', 'wrap', 'hard])'].join('\n');
    const sgf = new Sgf(content);

    assert.deepEqual(sgf.getRoot().data.C, ['linewrap\nhard']);
  });

  it('strips comments from all nodes', () => {
    const sgf = new Sgf('(;C[root];B[aa]C[move](;W[bb]C[branch]))');

    sgf.stripComments();

    assert.equal('C' in sgf.getRoot().data, false);
    assert.equal('C' in sgf.getNode(1)!.data, false);
    assert.equal('C' in sgf.getNode(2)!.data, false);
  });

  it('strips non-rotatable metadata from move nodes', () => {
    const sgf = new Sgf('(;SZ[19]C[root];B[aa]MN[1]C[move];W[bb]N[END]AB[cc]AW[dd]AE[ee]TR[ff])');

    sgf.stripMovesMetadata();

    assert.deepEqual(sgf.getRoot().data, { SZ: ['19'], C: ['root'] });
    assert.deepEqual(sgf.getNode(1)?.data, { B: ['aa'] });
    assert.deepEqual(sgf.getNode(2)?.data, { W: ['bb'], AB: ['cc'], AW: ['dd'], AE: ['ee'] });
  });

  it('updates root properties with direct and callback values', () => {
    const sgf = new Sgf('(;PB[Black]PW[White])');

    sgf.updateRootProperties({
      PB: (current) => `${current[0]} Player`,
      RE: 'B+R',
      GC: ['one', 'two'],
      ZZ: (current) => current,
    });

    assert.deepEqual(sgf.getRoot().data, {
      PB: ['Black Player'],
      PW: ['White'],
      RE: ['B+R'],
      GC: ['one', 'two'],
    });
  });

  it('updates root properties with numbers, null deletes, and undefined props are ignored', () => {
    const sgf = new Sgf('(;KM[6.5]PW[White])');

    sgf.updateRootProperties();
    sgf.updateRootProperties({
      KM: 7.5,
      PW: null,
    });

    assert.deepEqual(sgf.getRoot().data, {
      KM: ['7.5'],
    });
  });

  it('returns the unique longest branch as nodes', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb];B[cc])(;W[dd]))');
    const branch = sgf.getLongestBranch();

    assert.deepEqual(
      branch.map((node) => node.id),
      [0, 1, 2, 3]
    );
    assert.deepEqual(
      branch.map((node) => Object.keys(node.data)[0]),
      ['A', 'B', 'W', 'B']
    );
  });

  it('returns the branch to a node by id or node object', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb];B[cc])(;W[dd]))');
    const node = sgf.getNode(3)!;

    assert.deepEqual(
      sgf.getBranchToNode(3).map((item) => item.id),
      [0, 1, 2, 3]
    );
    assert.deepEqual(
      sgf.getBranchToNode(node).map((item) => item.id),
      [0, 1, 2, 3]
    );
    assert.throws(() => sgf.getBranchToNode(999), /SGF node 999 not found/);
  });

  it('returns the game branch ending with N[END] over a longer variation', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb]N[END])(;W[cc];B[dd];W[ee]))');
    const branch = sgf.getGameBranch();

    assert.deepEqual(
      branch.map((node) => node.id),
      [0, 1, 2]
    );
    assert.deepEqual(branch.at(-1)?.data.N, ['END']);
  });

  it('ignores node names other than N[END] when selecting the game branch', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb]N[NOTE])(;W[cc];B[dd]))');

    assert.deepEqual(
      sgf.getGameBranch().map((node) => node.id),
      [0, 1, 3, 4]
    );
  });

  it('falls back to the longest branch when there is no N[END]', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb])(;W[cc];B[dd]))');

    assert.deepEqual(
      sgf.getGameBranch().map((node) => node.id),
      sgf.getLongestBranch().map((node) => node.id)
    );
  });

  it('throws when multiple nodes are marked as N[END]', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb]N[END])(;W[cc]N[END]))');

    assert.throws(() => sgf.getGameBranch(), MultipleGameBranchEndsError);
    assert.throws(() => sgf.stripVariations(), MultipleGameBranchEndsError);
  });

  it('returns the main branch by following the first child', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb])(;W[dd];B[cc]))');
    const mainBranch = sgf.getMainBranch();
    const longestBranch = sgf.getLongestBranch();

    assert.deepEqual(
      mainBranch.map((node) => node.id),
      [0, 1, 2]
    );
    assert.deepEqual(
      longestBranch.map((node) => node.id),
      [0, 1, 3, 4]
    );
    assert.equal(mainBranch.length < longestBranch.length, true);
  });

  it('strips variations and rebuilds node lookup', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb];B[cc])(;W[dd]))');

    sgf.stripVariations();

    assert.deepEqual(
      sgf.getLongestBranch().map((node) => node.id),
      [0, 1, 2, 3]
    );
    assert.equal(sgf.getRoot().children[0].children[0].children.length, 1);
    assert.equal(sgf.getNode(4), undefined);
  });

  it('throws on equal longest branches before mutating', () => {
    const sgf = new Sgf('(;B[aa](;W[bb])(;W[cc]))');

    assert.throws(() => sgf.getLongestBranch(), MultipleLongestBranchesError);
    assert.throws(() => sgf.stripVariations(), MultipleLongestBranchesError);
    assert.equal(sgf.getRoot().children.length, 1);
    assert.equal(sgf.getRoot().children[0].children.length, 2);
  });

  it('strips variations to the game branch marker', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb]N[END];B[cc])(;W[dd];B[ee];W[ff]))');

    sgf.stripVariations();

    assert.deepEqual(
      sgf.getGameBranch().map((node) => node.data),
      [{ A: ['root'] }, { B: ['aa'] }, { W: ['bb'], N: ['END'] }]
    );
    assert.equal(sgf.getNode(3), undefined);
    assert.equal(sgf.getNode(4), undefined);
    assert.equal(sgf.getNode(5), undefined);
  });
});
