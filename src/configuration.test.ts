import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { it } from 'node:test';
import { promisify } from 'node:util';
import type { ArchiveConfiguration } from '@/schema/event';
import { loadConfiguration } from '@/configuration';

const execFileAsync = promisify(execFile);

it('loads the configuration bundled during the build without CONFIG or EVENT', async () => {
  const previousConfiguration = process.env.FORCED_CONFIGURATION;
  const configuration: ArchiveConfiguration = {
    dynamic: true,
    events: [{ id: 'epc', prefix: 'epc' }],
  };

  process.env.FORCED_CONFIGURATION = JSON.stringify(configuration);

  try {
    assert.deepEqual(await loadConfiguration(), configuration);
  } finally {
    if (previousConfiguration === undefined) {
      delete process.env.FORCED_CONFIGURATION;
    } else {
      process.env.FORCED_CONFIGURATION = previousConfiguration;
    }
  }
});

it('loads next.config.ts through the Next.js config loader without tsx', async () => {
  const script = [
    "const loadConfig = require('next/dist/server/config').default;",
    "const { PHASE_DEVELOPMENT_SERVER } = require('next/constants');",
    'loadConfig(PHASE_DEVELOPMENT_SERVER, process.cwd()).then((config) => {',
    '  process.stdout.write(JSON.stringify({ output: config.output }));',
    '});',
  ].join('\n');

  const { stdout } = await execFileAsync(process.execPath, ['-e', script], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_OPTIONS: '' },
  });

  const parsed = JSON.parse(stdout) as { output?: string };
  assert.ok(parsed.output === 'export' || parsed.output === 'standalone');
});
