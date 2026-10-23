import assert from 'node:assert/strict';
import { it } from 'node:test';
import { splitPlayerName } from './playerNames';
import { createPlayersSorter } from './sort';

it('keeps missing given names empty and preserves compound surnames', () => {
  assert.deepEqual(splitPlayerName('Kowalski'), { firstName: '', lastName: 'Kowalski' });
  assert.deepEqual(splitPlayerName(' Jan  de Mon '), { firstName: 'Jan', lastName: 'de Mon' });
  assert.deepEqual(splitPlayerName(''), { firstName: '', lastName: '' });
  assert.deepEqual([{ name: 'Kowalski' }, { name: 'Jan Adamski' }].sort(createPlayersSorter('pl')), [
    { name: 'Jan Adamski' },
    { name: 'Kowalski' },
  ]);
});
