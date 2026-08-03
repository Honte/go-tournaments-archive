import assert from 'node:assert/strict';
import { it } from 'node:test';
import type { ArchiveConfiguration } from '@/schema/event';
import { loadConfiguration } from '@/configuration';

it('loads the configuration bundled during the build without CONFIG or EVENT', async () => {
  const previousConfiguration = process.env.ARCHIVE_CONFIGURATION;
  const configuration: ArchiveConfiguration = {
    dynamic: true,
    events: [{ id: 'epc', prefix: 'epc' }],
  };

  process.env.ARCHIVE_CONFIGURATION = JSON.stringify(configuration);

  try {
    assert.deepEqual(await loadConfiguration(), configuration);
  } finally {
    if (previousConfiguration === undefined) {
      delete process.env.ARCHIVE_CONFIGURATION;
    } else {
      process.env.ARCHIVE_CONFIGURATION = previousConfiguration;
    }
  }
});
