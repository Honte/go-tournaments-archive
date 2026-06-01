import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Sgf } from './index';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'examples');

describe('Sgf stringify', () => {
  it('stringifies top-level game trees with parentheses', () => {
    const sgf = new Sgf(';CA[UTF-8]FF[4]GM[1]SZ[19];B[pd];W[dd](;B[qp])(;B[qq])');

    assert.equal(sgf.toString('minified'), '(;CA[UTF-8]FF[4]GM[1]SZ[19];B[pd];W[dd](;B[qp])(;B[qq]))');
    assert.equal(sgf.toString('verbose').startsWith('('), true);
  });

  it('stringifies malformed skipped variations', () => {
    const sgf = new Sgf('(;B[aa]()(;W[bb])())');

    assert.equal(sgf.toString('minified'), '(;;B[aa];W[bb])');
  });

  it('stringifies the first game tree from SGF collections', () => {
    const sgf = new Sgf('(;GN[first];B[aa])(;GN[second];B[bb])');

    assert.equal(sgf.toString('minified'), '(;GN[first];B[aa])');
  });

  it('stringifies rotated points in minified output', () => {
    const sgf = new Sgf('(;SZ[19]AB[aa][bb][aa:cc]AW[dd];B[dp];AE[pq]AW[cc])');

    sgf.rotate(90);

    assert.equal(sgf.toString('minified'), '(;SZ[19]AB[sa][rb][qa:sc]AW[pd];B[dd];AE[cp]AW[qc])');
  });

  it('stringifies stripped variations to the game branch marker', () => {
    const sgf = new Sgf('(;A[root];B[aa](;W[bb]N[END];B[cc])(;W[dd];B[ee];W[ff]))');

    sgf.stripVariations();

    assert.equal(sgf.toString('minified'), '(;A[root];B[aa];W[bb]N[END])');
  });

  it('always stringifies as a parenthesized tree', () => {
    const sgf = new Sgf('(;B[aa];W[bb])');

    assert.equal(sgf.toString('minified'), '(;;B[aa];W[bb])');
    assert.equal(sgf.toString().startsWith('('), true);
    assert.equal(sgf.toString('verbose').startsWith('('), true);
    assert.match(sgf.toString('verbose'), /\n  ;\n  ;B\[aa\]\n  ;W\[bb\]\n\)$/);
  });

  it('stringifies compact SGFs by default', () => {
    const sgf = new Sgf(
      '(;CA[utf-8]GM[1]FF[4]SZ[19]GC[comment]AP[test]XX[extra]GN[name]EV[event]PC[place]RO[1]DT[2025-05-18]PB[Black]BT[UK]BR[2d]PW[White]WT[DK]WR[3d]RE[B+R]KM[6.5]RU[japanese]TM[3600]LT[byo-yomi];B[aa];W[bb];B[cc];W[dd];B[ee];W[ff];B[gg];W[hh];B[ii];W[jj];B[kk];W[ll]N[END])'
    );

    assert.equal(
      sgf.toString(),
      [
        '(;FF[4]CA[utf-8]GM[1]SZ[19]',
        'GN[name]',
        'EV[event]',
        'PC[place]',
        'RO[1]',
        'DT[2025-05-18]',
        'PB[Black]BR[2d]BT[UK]',
        'PW[White]WR[3d]WT[DK]',
        'RE[B+R]',
        'KM[6.5]',
        'RU[japanese]',
        'TM[3600]LT[byo-yomi]',
        'XX[extra]',
        'AP[test]',
        'GC[comment]',
        ';B[aa];W[bb];B[cc];W[dd];B[ee];W[ff];B[gg];W[hh];B[ii];W[jj]',
        ';B[kk]',
        ';W[ll]N[END])',
      ].join('\n')
    );
  });

  it('keeps compact setup and annotated nodes on separate lines', () => {
    const sgf = new Sgf('(;FF[4]SZ[19];B[aa];W[bb];AE[aa]AB[cc];B[dd]C[note];W[ee];B[ff])');

    assert.equal(
      sgf.toString(),
      ['(;FF[4]SZ[19]', ';B[aa];W[bb]', ';AE[aa]AB[cc]', ';B[dd]C[note]', ';W[ee];B[ff])'].join('\n')
    );
  });

  it('preserves compact variation boundaries', () => {
    const sgf = new Sgf('(;FF[4]SZ[19];B[aa](;W[bb];B[cc])(;W[dd];B[ee]))');

    assert.equal(sgf.toString(), '(;FF[4]SZ[19]\n;B[aa]\n(;W[bb];B[cc])\n(;W[dd];B[ee]))');
  });

  it('throws on unsupported stringify levels', () => {
    const sgf = new Sgf('(;B[aa])');

    assert.throws(() => sgf.toString('pretty' as never), /Unsupported SGF stringify level: pretty/);
  });

  it('cleans SGFs through the static cleaner in compact format', () => {
    const output = Sgf.clean('(;PW[Old]C[root];B[aa](;W[bb]C[move];B[cc])(;W[dd]))', {
      PW: 'New',
      KM: 6.5,
      C: null,
    });

    assert.equal(output, '(;\nPW[New]\nKM[6.5]\n;B[aa];W[bb];B[cc])');
  });

  it('rotates cleaned SGFs through the static cleaner in compact format', () => {
    const output = Sgf.clean('(;SZ[19]PW[Old]C[root];B[dp])', { PW: 'New' }, 180);

    assert.equal(output, '(;SZ[19]\nPW[New]\n;B[pd])');
  });

  it('round-trips local SGF examples in all stringify levels', () => {
    for (const filename of ['2001-7-jlubos-wwoskresinski.sgf', 'complex.sgf', 'ff4_ex.sgf']) {
      const content = readFileSync(join(fixtureDir, filename), 'utf-8');
      const original = new Sgf(content);

      for (const level of ['minified', 'compact', 'verbose'] as const) {
        const output = original.toString(level);
        const reparsed = new Sgf(output);

        assert.equal(output.startsWith('('), true, `${filename} ${level} output starts with (`);
        assert.deepEqual(reparsed.getRoot().data, original.getRoot().data);
        assert.equal(reparsed.getRoot().children[0]?.parentId, reparsed.getRoot().id);
        assert.ok(reparsed.getLongestBranch().length > 0);
      }
    }
  });
});
