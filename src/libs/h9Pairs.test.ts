import assert from 'node:assert/strict';
import { it } from 'node:test';
import { parseH9 } from './h9';

it('splits four-letter pair countries in source member order', () => {
  for (const [country, pairCountry, memberCountries] of [
    ['pl', 'PL', ['PL', 'PL']],
    ['plDE', 'XX', ['PL', 'DE']],
    ['PLPL', 'PL', ['PL', 'PL']],
    ['plPL', 'PL', ['PL', 'PL']],
  ] as const) {
    const row = parseH9(`1 One Alice 2d Two Bob 4d 3d ${country} 0`).results[0];
    assert.equal(row.country, pairCountry);
    assert.deepEqual(
      row.members?.map((member) => member.country),
      memberCountries
    );
  }
  for (const country of ['P', 'POL', 'PLDEGB']) {
    assert.throws(() => parseH9(`1 One Alice 2d Two Bob 4d 3d ${country} 0`), /pair rank and country/);
  }
});

it('parses ranked pair members without exposing gender', () => {
  for (const names of ['de_Mon Cruella 2d Monkey_D Luffy 7d', 'One Alice 31k Li Bob 2d']) {
    const row = parseH9('1 ' + names + ' 5d JP xxx 2+/b 10 0|123|456').results[0];
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
  assert.throws(() => parseH9('; comment\n1 One Alice 2d Two Bob 4d JP xxx 0+'), /H9 line 2/);
  assert.throws(() => parseH9('1 One Alice 2d Two Bob 4d 3d JP xxx 0+ |123'), /two EGD/);
});

it('aligns rounds and preserves member metadata and source lines', () => {
  const { results } = parseH9(
    [
      '; EV[Pairs]',
      '',
      '# Source comment',
      '1 One Alice 31k Two Bob 31k 3D jp 1= 2?/b - 10|123|456',
      '2 Three Carol 1k Four Dan 3d 2d CZ Club 0 1?/w 0= 5',
    ].join('\n')
  );

  assert.deepEqual(results[0].members, [
    { surname: 'One', name: 'Alice', rank: '31k', country: 'JP', egd: 123 },
    { surname: 'Two', name: 'Bob', rank: '31k', country: 'JP', egd: 456 },
  ]);
  assert.deepEqual(results[1].members, [
    { surname: 'Three', name: 'Carol', rank: '1k', country: 'CZ', egd: undefined },
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
