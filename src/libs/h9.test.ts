import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parseH9 } from './h9';

describe('parseH9 jigo', () => {
  it('parses a draw without materializing a missing reciprocal entry', () => {
    const tournament = parseH9(table(['1 Alpha Alice 1d PL Club 0.5 2=', '2 Beta Bob 1d DE Club 0.5 0=']));

    assert.equal(tournament.results[0].games[0]?.result, '=');
    assert.equal(tournament.results[1].games[0], null);
  });

  it('treats zero-opponent variants as empty round cells', () => {
    const tournament = parseH9(table(['1 Alpha Alice 1d PL Club 0 0= 0=/', '2 Beta Bob 1d DE Club 0 0= 0=/']));

    assert.deepEqual(tournament.results[0].games, [null, null]);
  });

  it('keeps half-point score columns separate from game columns', () => {
    const tournament = parseH9(table(['1 Alpha Alice 1d PL Club 1= 2+', '2 Beta Bob 1d DE Club 0 1-']));

    assert.deepEqual(tournament.results[0].scores, ['1=']);
    assert.equal(tournament.results[0].games[0]?.result, '+');
  });

  it('recognizes a round containing only draws', () => {
    const tournament = parseH9(table(['1 Alpha Alice 1d PL Club 0.5 2=', '2 Beta Bob 1d DE Club 0.5 1=']));

    assert.equal(tournament.results[0].games[0]?.result, '=');
    assert.equal(tournament.results[1].games[0]?.result, '=');
  });

  it('parses conflicting results without validating them', () => {
    const tournament = parseH9(table(['1 Alpha Alice 1d PL Club 1 2+', '2 Beta Bob 1d DE Club 0.5 1=']));

    assert.equal(tournament.results[0].games[0]?.result, '+');
    assert.equal(tournament.results[1].games[0]?.result, '=');
  });
});

function table(rows: string[]) {
  return ['; EV[Test]', ...rows].join('\n');
}
