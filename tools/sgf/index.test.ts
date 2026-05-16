import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Sgf } from './index';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'examples');

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

  it('parses top-level game trees without outer parentheses and stringifies them with parentheses', () => {
    const sgf = new Sgf(';CA[UTF-8]FF[4]GM[1]SZ[19];B[pd];W[dd](;B[qp])(;B[qq])');

    assert.deepEqual(sgf.getRoot().data, { CA: ['UTF-8'], FF: ['4'], GM: ['1'], SZ: ['19'] });
    assert.equal(sgf.getNode(1)?.data.B[0], 'pd');
    assert.equal(sgf.getNode(2)?.children.length, 2);
    assert.equal(sgf.getNode(1)?.parentId, 0);
    assert.equal(sgf.getNode(2)?.parentId, 1);
    assert.equal(sgf.getNode(3)?.parentId, 2);
    assert.equal(sgf.getNode(4)?.parentId, 2);
    assert.equal(sgf.toString(false), '(;CA[UTF-8]FF[4]GM[1]SZ[19];B[pd];W[dd](;B[qp])(;B[qq]))');
    assert.equal(sgf.toString(true).startsWith('('), true);
  });

  it('skips empty variations in malformed SGF content', () => {
    const sgf = new Sgf('(;B[aa]()(;W[bb])())');

    assert.equal(sgf.getRoot().children.length, 1);
    assert.deepEqual(sgf.getRoot().children[0].data, { W: ['bb'] });
    assert.equal(sgf.toString(false), '(;B[aa];W[bb])');
  });

  it('accepts SGF collections by preserving the first game tree', () => {
    const sgf = new Sgf('(;GN[first];B[aa])(;GN[second];B[bb])');

    assert.deepEqual(sgf.getRoot().data, { GN: ['first'] });
    assert.equal(sgf.toString(false), '(;GN[first];B[aa])');
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
    assert.deepEqual(root.data.B, ['cc']);
    assert.deepEqual(root.data.XX, ['one', 'two']);
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
      ZZ: [],
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

  it('strips shorter branches and rebuilds node lookup', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb];B[cc])(;W[dd]))');

    sgf.stripShorterBranches();

    assert.deepEqual(
      sgf.getLongestBranch().map((node) => node.id),
      [0, 1, 2, 3]
    );
    assert.equal(sgf.getRoot().children[0].children[0].children.length, 1);
    assert.equal(sgf.getNode(4), undefined);
  });

  it('throws on equal longest branches before mutating', () => {
    const sgf = new Sgf('(;B[aa](;W[bb])(;W[cc]))');

    assert.throws(() => sgf.getLongestBranch(), /Multiple longest branches/);
    assert.throws(() => sgf.stripShorterBranches(), /Multiple longest branches/);
    assert.equal(sgf.getRoot().children.length, 2);
  });

  it('always stringifies as a parenthesized tree', () => {
    const sgf = new Sgf('(;B[aa];W[bb])');

    assert.equal(sgf.toString(false), '(;B[aa];W[bb])');
    assert.equal(sgf.toString().startsWith('('), true);
    assert.equal(sgf.toString(true).startsWith('('), true);
    assert.match(sgf.toString(true), /\n  ;B\[aa\]\n  ;W\[bb\]\n\)$/);
  });

  it('cleans SGFs through the static cleaner', () => {
    const output = Sgf.clean('(;PW[Old]C[root];B[aa](;W[bb]C[move];B[cc])(;W[dd]))', {
      PW: 'New',
      KM: 6.5,
      C: null,
    });

    assert.equal(output, '(;PW[New]KM[6.5];B[aa];W[bb];B[cc])');
  });

  it('round-trips local SGF examples in compact and pretty formats', () => {
    for (const filename of ['2001-7-jlubos-wwoskresinski.sgf', 'complex.sgf', 'ff4_ex.sgf']) {
      const content = readFileSync(join(fixtureDir, filename), 'utf-8');
      const original = new Sgf(content);

      for (const pretty of [false, true]) {
        const output = original.toString(pretty);
        const reparsed = new Sgf(output);

        assert.equal(output.startsWith('('), true, `${filename} ${pretty ? 'pretty' : 'compact'} output starts with (`);
        assert.deepEqual(reparsed.getRoot().data, original.getRoot().data);
        assert.equal(reparsed.getRoot().children[0]?.parentId, reparsed.getRoot().id);
        assert.ok(reparsed.getLongestBranch().length > 0);
      }
    }
  });
});
