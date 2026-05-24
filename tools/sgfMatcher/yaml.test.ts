import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseDocument } from 'yaml';
import { updateYamlDoc } from './yaml';

describe('updateYamlDoc', () => {
  it('reports unchanged content when generated matcher data is the same', () => {
    const doc = parseDocument(`stages:
  - type: tournament
    games:
      - 1-2 1:B+R round:1 sgf:2025/game.sgf
    unmatchedSgfs:
      - 1-? ? round:1 sgf:2025/missing.sgf # no matching game
`);

    const changed = updateYamlDoc(doc, 0, {
      previousEntries: [],
      reusedEntries: ['1-2 1:B+R round:1 sgf:2025/game.sgf'],
      matchedEntries: [],
      unmatchedEntries: [
        {
          filename: '2025/missing.sgf',
          line: '1-? ? round:1 sgf:2025/missing.sgf',
          reasons: ['no matching game'],
        },
      ],
      totalSgfs: 2,
      claimedSgfs: ['2025/game.sgf', '2025/missing.sgf'],
    });

    assert.equal(changed, false);
  });

  it('reports changed content when generated matcher data differs', () => {
    const doc = parseDocument(`stages:
  - type: tournament
    games:
      - 1-2 1:B+R round:1 sgf:2025/game.sgf
`);

    const changed = updateYamlDoc(doc, 0, {
      previousEntries: [],
      reusedEntries: ['1-2 1:B+R round:1 sgf:2025/game.sgf'],
      matchedEntries: ['3-4 3:W+R round:1 sgf:2025/other.sgf'],
      unmatchedEntries: [],
      totalSgfs: 2,
      claimedSgfs: ['2025/game.sgf', '2025/other.sgf'],
    });

    assert.equal(changed, true);
  });

  it('updates explicit stage games in place and writes unmatched SGFs', () => {
    const doc = parseDocument(`stages:
  - type: league
    rounds:
      - - kg-mf kg:B+R yt:https://example.test
`);

    const changed = updateYamlDoc(doc, 0, {
      previousEntries: [],
      reusedEntries: [],
      matchedEntries: ['kg-mf kg:B+R yt:https://example.test sgf:1997/game.sgf'],
      unmatchedEntries: [
        {
          filename: '1997/missing.sgf',
          line: '?-? ? sgf:1997/missing.sgf',
          reasons: ['no player names found'],
        },
      ],
      totalSgfs: 2,
      claimedSgfs: ['1997/game.sgf', '1997/missing.sgf'],
      inlineUpdates: [{ path: ['rounds', 0, 0], value: 'kg-mf kg:B+R yt:https://example.test sgf:1997/game.sgf' }],
    });

    assert.equal(changed, true);
    assert.equal(
      doc.toString({ lineWidth: 0 }),
      `stages:
  - type: league
    rounds:
      - - kg-mf kg:B+R yt:https://example.test sgf:1997/game.sgf
    unmatchedSgfs:
      - ?-? ? sgf:1997/missing.sgf # no player names found
`
    );
  });
});
