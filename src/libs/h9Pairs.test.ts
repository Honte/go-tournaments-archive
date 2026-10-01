import assert from 'node:assert/strict';
import { it } from 'node:test';
import { parseH9 } from './h9';

it('parses all pair layouts without exposing gender', () => {
  for (const names of [
    'Cruella_de_Mon Monkey_D_Luffy',
    'de_Mon Cruella Monkey_D Luffy',
    'de_Mon Cruella 2d Monkey_D Luffy 7d',
    'de_Mon Cruella 2d GB Monkey_D Luffy 7d JP',
  ]) {
    const row = parseH9('1 ' + names + ' 5d JP xxx 2+/b 10 0|123|456', true).results[0];
    assert.equal(row.rank, '5d');
    assert.equal(row.members?.length, 2);
    assert.deepEqual(
      row.members?.map((m) => m.egd),
      [123, 456]
    );
    assert.deepEqual(row.scores, ['10', '0']);
    assert.equal(row.games[0]?.opponent, 2);
  }
});

it('reports malformed pair rows and requires a source pair rank', () => {
  assert.throws(() => parseH9('; comment\n1 One Alice 2d Two Bob 4d JP xxx 0+', true), /H9 line 2/);
  assert.throws(() => parseH9('1 One Alice Two Bob 3d JP xxx 0+ |123', true), /two EGD/);
});

it('aligns rounds across mixed layouts and preserves member metadata and source lines', () => {
  const { results } = parseH9(
    [
      '; EV[Mixed layouts]',
      '',
      '# Source comment',
      '1 Alice_One Bob_Two 3D jp 1= 2?/b - 10|123|456',
      '2 Three Carol 1k DE Four Dan 3d CZ 2d CZ Club 0 1?/w 0= 5',
    ].join('\n'),
    true
  );

  assert.deepEqual(results[0].members, [
    { surname: 'Alice One', name: '', rank: undefined, country: 'JP', egd: 123 },
    { surname: 'Bob Two', name: '', rank: undefined, country: 'JP', egd: 456 },
  ]);
  assert.deepEqual(results[1].members, [
    { surname: 'Three', name: 'Carol', rank: '1k', country: 'DE', egd: undefined },
    { surname: 'Four', name: 'Dan', rank: '3d', country: 'CZ', egd: undefined },
  ]);
  assert.deepEqual(
    results.map((row) => row.line),
    [4, 5]
  );
  assert.deepEqual(
    results.map((row) => row.club),
    ['', 'Club']
  );
  assert.deepEqual(
    results.map((row) => row.rank),
    ['3d', '2d']
  );
  assert.deepEqual(
    results.map((row) => row.scores),
    [
      ['1=', '10'],
      ['0', '5'],
    ]
  );
  for (const row of results) {
    assert.equal(row.games[0]?.round, 1);
    assert.equal(row.games[0]?.result, '?');
    assert.equal(row.games[1], null);
  }
});
