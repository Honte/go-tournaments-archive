import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { mergeEventPlayers, updateEventPlayersContent } from './file';

describe('updateEventPlayersContent', () => {
  it('does not rewrite content when no players are missing', () => {
    const content = `# keep file comment
players:
  # keep player comment
  - id: alpha
    name: Alpha Player
    custom: keep
`;

    const result = updateEventPlayersContent(
      content,
      [{ id: 'alpha', name: 'Alpha Player', egd: 123, nickname: [], pastNames: [] }],
      {
        includeCountry: true,
      }
    );

    assert.equal(result.changed, false);
    assert.equal(result.added, 0);
    assert.equal(result.content, content);
  });

  it('appends only missing players while preserving comments and extra attributes', () => {
    const result = updateEventPlayersContent(
      `# keep file comment
players:
  # keep player comment
  - id: alpha
    name: Alpha Player
    custom: keep
`,
      [
        { id: 'alpha', name: 'Alpha Player', egd: 123, nickname: [], pastNames: [] },
        {
          id: 'beta',
          name: 'Beta Player',
          country: 'PL',
          original: 'Beta Original',
          nickname: ['beta-go'],
          pastNames: [],
        },
      ],
      { includeCountry: true }
    );

    assert.equal(result.added, 1);
    assert.match(result.content, /# keep file comment/);
    assert.match(result.content, /# keep player comment/);
    assert.match(result.content, /custom: keep/);
    assert.doesNotMatch(result.content, /id: alpha\n\s+name: Alpha Player\n\s+egd: 123/);
    assert.match(
      result.content,
      /id: beta\n\s+name: Beta Player\n\s+country: PL\n\s+original: Beta Original\n\s+nickname: beta-go/
    );
  });

  it('can fill missing existing fields while preserving row attributes', () => {
    const result = updateEventPlayersContent(
      `players:
  - id: alpha
    name: Alpha Player
    custom: keep
`,
      [{ id: 'alpha', name: 'Alpha Player', country: 'PL', egd: 123, nickname: [], pastNames: [] }],
      { includeCountry: true, updateExisting: true }
    );

    assert.equal(result.added, 0);
    assert.equal(result.updated, 1);
    assert.match(result.content, /custom: keep/);
    assert.match(result.content, /country: PL/);
    assert.match(result.content, /egd: 123/);
  });
});

describe('mergeEventPlayers', () => {
  it('keeps display names from file and uses tournament names for new players', () => {
    const players = mergeEventPlayers(
      [{ id: 'alpha', name: 'Alpha Display', nickname: [], pastNames: [] }],
      [
        { id: 'alpha', name: 'Alpha Tournament', original: 'Alpha Original', nickname: [], pastNames: [] },
        { id: 'beta', name: 'Beta Tournament', nickname: [], pastNames: [] },
      ]
    );

    assert.deepEqual(players, [
      { id: 'alpha', name: 'Alpha Display', original: 'Alpha Original', nickname: [], pastNames: [] },
      { id: 'beta', name: 'Beta Tournament', nickname: [], pastNames: [] },
    ]);
  });
});
