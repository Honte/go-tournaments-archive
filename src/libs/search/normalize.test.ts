import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { normalizeSearchText, tokenizeSearchText } from './normalize';

describe('search text normalization', () => {
  it('folds Latin letters without a local replacement table and preserves other scripts', () => {
    assert.equal(normalizeSearchText('ł ø đ ð þ æ œ ß'), 'l o d d th ae oe ss');
    assert.equal(normalizeSearchText('Ł Ø Đ Ð Þ Æ Œ ẞ'), 'l o d d th ae oe ss');
    assert.equal(normalizeSearchText('Ĳ ĳ Ŋ ŋ'), 'ij ij n n');
    assert.equal(normalizeSearchText('É e\u0301'), 'e e');
    assert.equal(normalizeSearchText('  Jan—Nowak\t\n Żuk!  '), 'jan nowak zuk');
    assert.equal(normalizeSearchText('张三 김민수 Кирилл'), '张三 김민수'.normalize('NFKD') + ' кирилл');
    assert.equal(normalizeSearchText('Ｆｕｌｌ ﬃ'), 'full ffi');
    assert.equal(normalizeSearchText('…'), '');
    assert.equal(normalizeSearchText(), '');
  });

  it('normalizes accents and punctuation into tokens', () => {
    assert.equal(normalizeSearchText('  Łódź—Żuk  '), 'lodz zuk');
    assert.deepEqual(tokenizeSearchText('Jan Nowak-Rybicki'), ['jan', 'nowak', 'rybicki']);
  });
});
