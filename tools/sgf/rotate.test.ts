import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Sgf } from './index';

const fixtureDir = join(dirname(fileURLToPath(import.meta.url)), 'examples');

describe('Sgf rotation', () => {
  it('does not alter SGF points for default and zero-degree rotation', () => {
    const content = '(;SZ[19];B[dp];W[])';

    assert.equal(new Sgf(content).rotate().getNode(1)?.data.B[0], 'dp');
    assert.equal(new Sgf(content).rotate(0).getNode(1)?.data.B[0], 'dp');
  });

  it('rotates move coordinates clockwise', () => {
    assert.equal(new Sgf('(;SZ[19];B[dp])').rotate(90).getNode(1)?.data.B[0], 'dd');
    assert.equal(new Sgf('(;SZ[19];B[dp])').rotate(180).getNode(1)?.data.B[0], 'pd');
    assert.equal(new Sgf('(;SZ[19];B[pq])').rotate(270).getNode(1)?.data.B[0], 'qd');
  });

  it('rotates setup and edit coordinates including compressed rectangles', () => {
    const sgf = new Sgf('(;SZ[19]AB[aa][bb][aa:cc]AW[dd];B[dp];AE[pq]AW[cc])');

    sgf.rotate(90);

    assert.deepEqual(sgf.getRoot().data, { SZ: ['19'], AB: ['sa', 'rb', 'qa:sc'], AW: ['pd'] });
    assert.deepEqual(sgf.getNode(1)?.data, { B: ['dd'] });
    assert.deepEqual(sgf.getNode(2)?.data, { AE: ['cp'], AW: ['qc'] });
  });

  it('preserves pass moves at the board-size coordinate and normalizes other off-board moves to empty', () => {
    const sgf = new Sgf('(;SZ[19];B[];W[tt])');

    sgf.rotate(90);

    assert.equal(sgf.getNode(1)?.data.B[0], '');
    assert.equal(sgf.getNode(2)?.data.W[0], 'tt');
  });

  it('rejects rotation ranges that use off-board coordinates', () => {
    assert.throws(() => new Sgf('(;SZ[19]AB[aa:tt][aa:ts][aa:st])').rotate(90), /Unsupported position: ts/);
  });

  it('rejects unsupported rotation angles', () => {
    assert.throws(() => new Sgf('(;SZ[19];B[aa])').rotate(45 as 90), /Unsupported SGF rotation angle: 45/);
  });

  it('rotates existing PGC examples so their first move lands in the upper-right board area', () => {
    const examples = [
      ['events/pgc/sgf/2025/2025-1-mmajka-khabu.sgf', 180, 'pd'],
      ['events/pgc/sgf/2025/2025-2-lsoldan-mmajka.sgf', 180, 'pd'],
      ['events/pgc/sgf/2025/2025-2-cczernecki-mkosz.sgf', 270, 'qd'],
    ] as const;

    for (const [path, rotation, firstMove] of examples) {
      const content = readFileSync(join(fixtureDir, '..', '..', '..', path), 'utf-8');
      const sgf = new Sgf(content).rotate(rotation);

      assert.equal(sgf.getNode(1)?.data.B[0], firstMove);
    }
  });
});
